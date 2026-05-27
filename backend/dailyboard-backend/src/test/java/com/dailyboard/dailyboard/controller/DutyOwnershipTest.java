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

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldRejectDutyEndpointWithoutToken() throws Exception {
        mockMvc.perform(get("/api/v1/duties/not-owned-planner"))
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
        return mockMvc.perform(post("/api/v1/duties/{plannerId}", plannerId)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        [
                          {
                            "name": "%s",
                            "description": "Owned duty",
                            "weekDay": "MONDAY",
                            "from": "09:00:00",
                            "to": "10:00:00",
                            "color": "#123456"
                          }
                        ]
                        """.formatted(name)));
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
