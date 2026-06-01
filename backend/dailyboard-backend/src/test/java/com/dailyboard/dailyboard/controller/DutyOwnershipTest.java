package com.dailyboard.dailyboard.controller;

import com.dailyboard.dailyboard.model.dto.AuthRequestDto;
import com.dailyboard.dailyboard.repository.DutyRepository;
import com.dailyboard.dailyboard.repository.PlannerRepository;
import com.dailyboard.dailyboard.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class DutyOwnershipTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DutyRepository dutyRepository;

    @Autowired
    private PlannerRepository plannerRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        dutyRepository.deleteAll();
        plannerRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void shouldLetOwnerCreateAndReadDutiesForOwnedPlanner() throws Exception {
        String userAToken = registerAndGetToken("user-a@example.com");
        String userAPlannerId = createPlanner(userAToken, "User A Planner");

        createDuty(userAToken, userAPlannerId, "User A Duty")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("User A Duty"));

        mockMvc.perform(get("/api/v1/duties/{plannerId}", userAPlannerId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(userAToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("User A Duty"));
    }

    @Test
    void shouldBlockCrossUserDutyCreateByPlannerId() throws Exception {
        String userAToken = registerAndGetToken("user-a@example.com");
        String userBToken = registerAndGetToken("user-b@example.com");
        String userAPlannerId = createPlanner(userAToken, "User A Planner");

        createDuty(userBToken, userAPlannerId, "Injected Duty")
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldBlockCrossUserDutyReadByPlannerId() throws Exception {
        String userAToken = registerAndGetToken("user-a@example.com");
        String userBToken = registerAndGetToken("user-b@example.com");
        String userAPlannerId = createPlanner(userAToken, "User A Planner");
        createDuty(userAToken, userAPlannerId, "User A Duty")
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/duties/{plannerId}", userAPlannerId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(userBToken)))
                .andExpect(status().isNotFound())
                .andExpect(content().string(not(containsString("User A Duty"))));
    }

    @Test
    void shouldBlockCrossUserDynamicDutyReadByPlannerId() throws Exception {
        String userAToken = registerAndGetToken("user-a@example.com");
        String userBToken = registerAndGetToken("user-b@example.com");
        String userAPlannerId = createPlanner(userAToken, "User A Planner");
        createDuty(userAToken, userAPlannerId, "User A Dynamic Duty", "2026-06-01")
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/duties/dynamic/{plannerId}", userAPlannerId)
                        .queryParam("from", "2026-06-01")
                        .queryParam("to", "2026-06-07")
                        .header(HttpHeaders.AUTHORIZATION, bearer(userBToken)))
                .andExpect(status().isNotFound())
                .andExpect(content().string(not(containsString("User A Dynamic Duty"))));
    }

    @Test
    void shouldListOnlyCurrentUserConstantDuties() throws Exception {
        String userAToken = registerAndGetToken("user-a@example.com");
        String userBToken = registerAndGetToken("user-b@example.com");
        String userAPlannerId = createPlanner(userAToken, "User A Planner");
        String userBPlannerId = createPlanner(userBToken, "User B Planner");
        createDuty(userAToken, userAPlannerId, "User A Constant Duty")
                .andExpect(status().isCreated());
        createDuty(userBToken, userBPlannerId, "User B Constant Duty")
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/duties/constant")
                        .header(HttpHeaders.AUTHORIZATION, bearer(userAToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("User A Constant Duty"))
                .andExpect(content().string(not(containsString("User B Constant Duty"))));

        mockMvc.perform(get("/api/v1/duties/constant")
                        .header(HttpHeaders.AUTHORIZATION, bearer(userBToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("User B Constant Duty"))
                .andExpect(content().string(not(containsString("User A Constant Duty"))));
    }

    @Test
    void shouldAttachCreatedDutyToOwnedPathPlannerWhenBodyPlannerIdDiffers() throws Exception {
        String userAToken = registerAndGetToken("user-a@example.com");
        String userBToken = registerAndGetToken("user-b@example.com");
        String userAPlannerId = createPlanner(userAToken, "User A Planner");
        String userBPlannerId = createPlanner(userBToken, "User B Planner");

        createDuty(userAToken, userAPlannerId, "Path Planner Duty", null, "09:00:00", "10:00:00", userBPlannerId)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Path Planner Duty"))
                .andExpect(jsonPath("$[0].plannerId").value(userAPlannerId));

        mockMvc.perform(get("/api/v1/duties/{plannerId}", userBPlannerId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(userBToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)))
                .andExpect(content().string(not(containsString("Path Planner Duty"))));
    }

    @Test
    void shouldNotConflictWithOverlappingDutiesInAnotherUsersPlanner() throws Exception {
        String userAToken = registerAndGetToken("user-a@example.com");
        String userBToken = registerAndGetToken("user-b@example.com");
        String userAPlannerId = createPlanner(userAToken, "User A Planner");
        String userBPlannerId = createPlanner(userBToken, "User B Planner");
        createDuty(userAToken, userAPlannerId, "User A Overlap Duty", null, "09:00:00", "10:00:00", null)
                .andExpect(status().isCreated());

        createDuty(userBToken, userBPlannerId, "User B Overlap Duty", null, "09:30:00", "10:30:00", null)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("User B Overlap Duty"));
    }

    @Test
    void shouldRejectDutyEndpointWithoutToken() throws Exception {
        mockMvc.perform(get("/api/v1/duties/not-owned-planner"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectNewlyCoveredDutyEndpointsWithoutToken() throws Exception {
        mockMvc.perform(get("/api/v1/duties/dynamic/not-owned-planner")
                        .queryParam("from", "2026-06-01")
                        .queryParam("to", "2026-06-07"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/duties/constant"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/v1/duties/not-owned-planner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(dutyPayload("Unauthorized Duty", null, "09:00:00", "10:00:00", null)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectDutyEndpointWithInvalidToken() throws Exception {
        mockMvc.perform(get("/api/v1/duties/constant")
                        .header(HttpHeaders.AUTHORIZATION, bearer("invalid-token")))
                .andExpect(status().isUnauthorized());
    }

    private String registerAndGetToken(String email) throws Exception {
        String response = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AuthRequestDto(email, "secret123"))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).get("token").asText();
    }

    private String createPlanner(String token, String name) throws Exception {
        String response = mockMvc.perform(post("/api/v1/planners")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "%s",
                                  "note": "Owned planner",
                                  "startTime": "08:00:00",
                                  "endTime": "16:00:00",
                                  "isConstant": false
                                }
                                """.formatted(name)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode planner = objectMapper.readTree(response);

        return planner.get("id").asText();
    }

    private org.springframework.test.web.servlet.ResultActions createDuty(
            String token,
            String plannerId,
            String name
    ) throws Exception {
        return createDuty(token, plannerId, name, null);
    }

    private org.springframework.test.web.servlet.ResultActions createDuty(
            String token,
            String plannerId,
            String name,
            String effectiveDate
    ) throws Exception {
        return createDuty(token, plannerId, name, effectiveDate, "09:00:00", "10:00:00", null);
    }

    private org.springframework.test.web.servlet.ResultActions createDuty(
            String token,
            String plannerId,
            String name,
            String effectiveDate,
            String from,
            String to,
            String bodyPlannerId
    ) throws Exception {
        return mockMvc.perform(post("/api/v1/duties/{plannerId}", plannerId)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(dutyPayload(name, effectiveDate, from, to, bodyPlannerId)));
    }

    private String dutyPayload(
            String name,
            String effectiveDate,
            String from,
            String to,
            String bodyPlannerId
    ) {
        String effectiveDateProperty = effectiveDate == null ? "" : """
                                    "effectiveDate": "%s",
                        """.formatted(effectiveDate);
        String plannerIdProperty = bodyPlannerId == null ? "" : """
                                    "plannerId": "%s",
                        """.formatted(bodyPlannerId);

        return """
                [
                  {
                    "name": "%s",
                    "description": "Owned duty",
                    "weekDay": "MONDAY",
                %s%s    "from": "%s",
                    "to": "%s",
                    "color": "#123456"
                  }
                ]
                """.formatted(name, effectiveDateProperty, plannerIdProperty, from, to);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
