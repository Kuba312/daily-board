package com.dailyboard.dailyboard.controller;

import com.dailyboard.dailyboard.model.dao.Duty;
import com.dailyboard.dailyboard.model.dao.Planner;
import com.dailyboard.dailyboard.model.dto.AuthRequestDto;
import com.dailyboard.dailyboard.repository.DutyRepository;
import com.dailyboard.dailyboard.repository.PlannerRepository;
import com.dailyboard.dailyboard.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
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
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
    void shouldRejectOverlappingDutyInSamePlanner() throws Exception {
        String userAToken = registerAndGetToken("user-a@example.com");
        String userAPlannerId = createPlanner(userAToken, "User A Planner");
        createDuty(userAToken, userAPlannerId, "Existing Same Planner Duty", "2026-06-01", "09:00:00", "10:00:00", null)
                .andExpect(status().isCreated());

        createDuty(userAToken, userAPlannerId, "Overlapping Same Planner Duty", "2026-06-01", "09:30:00", "10:30:00", null)
                .andExpect(status().isConflict())
                .andExpect(content().string(containsString("Existing Same Planner Duty")));
    }

    @Test
    void shouldLetOwnerUpdateOwnedDuty() throws Exception {
        String userAToken = registerAndGetToken("user-a@example.com");
        String userAPlannerId = createPlanner(userAToken, "User A Planner");
        String dutyId = createDutyAndGetId(userAToken, userAPlannerId, "Original Duty", "2026-06-01", "09:00:00", "10:00:00", null);

        mockMvc.perform(put("/api/v1/duties/{plannerId}/{dutyId}", userAPlannerId, dutyId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(userAToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(dutyUpdatePayload("Updated Duty", "2026-06-02", "11:00:00", "12:00:00", null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(dutyId))
                .andExpect(jsonPath("$.name").value("Updated Duty"))
                .andExpect(jsonPath("$.effectiveDate").value("2026-06-02"))
                .andExpect(jsonPath("$.from").value("11:00:00"))
                .andExpect(jsonPath("$.to").value("12:00:00"))
                .andExpect(jsonPath("$.plannerId").value(userAPlannerId));
    }

    @Test
    void shouldLetOwnerDeleteOwnedDuty() throws Exception {
        String userAToken = registerAndGetToken("user-a@example.com");
        String userAPlannerId = createPlanner(userAToken, "User A Planner");
        String dutyId = createDutyAndGetId(userAToken, userAPlannerId, "Duty To Delete", "2026-06-01", "09:00:00", "10:00:00", null);

        mockMvc.perform(delete("/api/v1/duties/{plannerId}/{dutyId}", userAPlannerId, dutyId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(userAToken)))
                .andExpect(status().isNoContent());

        assertThat(dutyRepository.findByIdAndPlannerId(dutyId, userAPlannerId)).isEmpty();
    }

    @Test
    void shouldBlockCrossUserDutyUpdateAndDelete() throws Exception {
        String userAToken = registerAndGetToken("user-a@example.com");
        String userBToken = registerAndGetToken("user-b@example.com");
        String userAPlannerId = createPlanner(userAToken, "User A Planner");
        String dutyId = createDutyAndGetId(userAToken, userAPlannerId, "User A Duty", "2026-06-01", "09:00:00", "10:00:00", null);

        mockMvc.perform(put("/api/v1/duties/{plannerId}/{dutyId}", userAPlannerId, dutyId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(userBToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(dutyUpdatePayload("Injected Duty", "2026-06-01", "11:00:00", "12:00:00", null)))
                .andExpect(status().isNotFound())
                .andExpect(content().string(not(containsString("User A Duty"))));

        mockMvc.perform(delete("/api/v1/duties/{plannerId}/{dutyId}", userAPlannerId, dutyId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(userBToken)))
                .andExpect(status().isNotFound())
                .andExpect(content().string(not(containsString("User A Duty"))));

        assertThat(dutyRepository.findByIdAndPlannerId(dutyId, userAPlannerId)).isPresent();
    }

    @Test
    void shouldRejectDutyMutationThroughOwnedPlannerWhenDutyBelongsToAnotherPlanner() throws Exception {
        String userAToken = registerAndGetToken("user-a@example.com");
        String firstPlannerId = createPlanner(userAToken, "User A First Planner");
        String secondPlannerId = createPlanner(userAToken, "User A Second Planner");
        String secondPlannerDutyId = createDutyAndGetId(userAToken, secondPlannerId, "Second Planner Duty", "2026-06-01", "09:00:00", "10:00:00", null);

        mockMvc.perform(put("/api/v1/duties/{plannerId}/{dutyId}", firstPlannerId, secondPlannerDutyId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(userAToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(dutyUpdatePayload("Wrong Planner Update", "2026-06-01", "11:00:00", "12:00:00", null)))
                .andExpect(status().isNotFound())
                .andExpect(content().string(not(containsString("Second Planner Duty"))));

        mockMvc.perform(delete("/api/v1/duties/{plannerId}/{dutyId}", firstPlannerId, secondPlannerDutyId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(userAToken)))
                .andExpect(status().isNotFound())
                .andExpect(content().string(not(containsString("Second Planner Duty"))));

        assertThat(dutyRepository.findByIdAndPlannerId(secondPlannerDutyId, secondPlannerId)).isPresent();
    }

    @Test
    void shouldKeepUrlPlannerWhenUpdateBodyPlannerIdDiffers() throws Exception {
        String userAToken = registerAndGetToken("user-a@example.com");
        String firstPlannerId = createPlanner(userAToken, "User A First Planner");
        String secondPlannerId = createPlanner(userAToken, "User A Second Planner");
        String dutyId = createDutyAndGetId(userAToken, firstPlannerId, "Path Planner Duty", "2026-06-01", "09:00:00", "10:00:00", null);

        mockMvc.perform(put("/api/v1/duties/{plannerId}/{dutyId}", firstPlannerId, dutyId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(userAToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(dutyUpdatePayload("Still Path Planner Duty", "2026-06-01", "11:00:00", "12:00:00", secondPlannerId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plannerId").value(firstPlannerId));

        assertThat(dutyRepository.findByIdAndPlannerId(dutyId, firstPlannerId)).isPresent();
        assertThat(dutyRepository.findByIdAndPlannerId(dutyId, secondPlannerId)).isEmpty();
    }

    @Test
    void shouldNotConflictWithItselfWhenUpdatingDutyWithoutTimeChange() throws Exception {
        String userAToken = registerAndGetToken("user-a@example.com");
        String userAPlannerId = createPlanner(userAToken, "User A Planner");
        String dutyId = createDutyAndGetId(userAToken, userAPlannerId, "Original Duty", "2026-06-01", "09:00:00", "10:00:00", null);

        mockMvc.perform(put("/api/v1/duties/{plannerId}/{dutyId}", userAPlannerId, dutyId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(userAToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(dutyUpdatePayload("Renamed Duty", "2026-06-01", "09:00:00", "10:00:00", null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Renamed Duty"));
    }

    @Test
    void shouldRejectDutyUpdateThatCreatesRealConflict() throws Exception {
        String userAToken = registerAndGetToken("user-a@example.com");
        String userAPlannerId = createPlanner(userAToken, "User A Planner");
        createDutyAndGetId(userAToken, userAPlannerId, "Existing Same Planner Duty", "2026-06-01", "09:00:00", "10:00:00", null);
        String dutyId = createDutyAndGetId(userAToken, userAPlannerId, "Duty To Move", "2026-06-01", "11:00:00", "12:00:00", null);

        mockMvc.perform(put("/api/v1/duties/{plannerId}/{dutyId}", userAPlannerId, dutyId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(userAToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(dutyUpdatePayload("Conflicting Move", "2026-06-01", "09:30:00", "10:30:00", null)))
                .andExpect(status().isConflict())
                .andExpect(content().string(containsString("Existing Same Planner Duty")));
    }

    @Test
    void shouldNotConflictWithOverlappingDutiesInDifferentPlannerOwnedBySameUser() throws Exception {
        String userAToken = registerAndGetToken("user-a@example.com");
        String firstPlannerId = createPlanner(userAToken, "User A First Planner");
        String secondPlannerId = createPlanner(userAToken, "User A Second Planner");
        createDuty(userAToken, firstPlannerId, "First Planner Overlap Duty", "2026-06-01", "09:00:00", "10:00:00", null)
                .andExpect(status().isCreated());

        createDuty(userAToken, secondPlannerId, "Second Planner Overlap Duty", "2026-06-01", "09:30:00", "10:30:00", null)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Second Planner Overlap Duty"))
                .andExpect(content().string(not(containsString("First Planner Overlap Duty"))));
    }

    @Test
    void shouldNotConflictWithOverlappingLegacyUnownedPlannerDuty() throws Exception {
        String userAToken = registerAndGetToken("user-a@example.com");
        String ownedPlannerId = createPlanner(userAToken, "User A Owned Planner");
        createLegacyUnownedPlannerDuty("Legacy Pre Auth Overlap Duty");

        createDuty(userAToken, ownedPlannerId, "Owned Planner Overlap Duty", "2026-06-01", "09:30:00", "10:30:00", null)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Owned Planner Overlap Duty"))
                .andExpect(content().string(not(containsString("Legacy Pre Auth Overlap Duty"))));
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

        mockMvc.perform(put("/api/v1/duties/not-owned-planner/not-owned-duty")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(dutyUpdatePayload("Unauthorized Duty", null, "09:00:00", "10:00:00", null)))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(delete("/api/v1/duties/not-owned-planner/not-owned-duty"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectDutyEndpointWithInvalidToken() throws Exception {
        mockMvc.perform(get("/api/v1/duties/constant")
                        .header(HttpHeaders.AUTHORIZATION, bearer("invalid-token")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldExposeDutyMutationRoutesInOpenApi() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/v1/duties/{plannerId}/{dutyId}'].put").exists())
                .andExpect(jsonPath("$.paths['/api/v1/duties/{plannerId}/{dutyId}'].delete").exists());
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

    private String createDutyAndGetId(
            String token,
            String plannerId,
            String name,
            String effectiveDate,
            String from,
            String to,
            String bodyPlannerId
    ) throws Exception {
        String response = createDuty(token, plannerId, name, effectiveDate, from, to, bodyPlannerId)
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).get(0).get("id").asText();
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

    private String dutyUpdatePayload(
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
                {
                  "name": "%s",
                  "description": "Updated owned duty",
                  "weekDay": "MONDAY",
                %s%s  "from": "%s",
                  "to": "%s",
                  "color": "#abcdef"
                }
                """.formatted(name, effectiveDateProperty, plannerIdProperty, from, to);
    }

    private void createLegacyUnownedPlannerDuty(String name) {
        Planner legacyPlanner = new Planner();
        legacyPlanner.setName("Legacy Planner");
        legacyPlanner.setNote("Pre-auth planner");
        legacyPlanner.setStartTime(LocalTime.parse("08:00:00"));
        legacyPlanner.setEndTime(LocalTime.parse("16:00:00"));
        legacyPlanner.setIsConstant(false);

        Planner savedLegacyPlanner = plannerRepository.save(legacyPlanner);

        Duty legacyDuty = new Duty();
        legacyDuty.setName(name);
        legacyDuty.setDescription("Pre-auth duty");
        legacyDuty.setWeekDay(DayOfWeek.MONDAY);
        legacyDuty.setEffectiveDate(LocalDate.parse("2026-06-01"));
        legacyDuty.setStartTime(LocalTime.parse("09:00:00"));
        legacyDuty.setEndTime(LocalTime.parse("10:00:00"));
        legacyDuty.setColor("#654321");
        legacyDuty.setPlanner(savedLegacyPlanner);

        dutyRepository.save(legacyDuty);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
