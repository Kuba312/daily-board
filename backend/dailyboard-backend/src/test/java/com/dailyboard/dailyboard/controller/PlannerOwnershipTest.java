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
import static org.hamcrest.Matchers.containsString;
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
class PlannerOwnershipTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PlannerRepository plannerRepository;

    @Autowired
    private DutyRepository dutyRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        dutyRepository.deleteAll();
        plannerRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void shouldCreatePlannerWithAuthenticatedOwner() throws Exception {
        String token = registerAndGetToken("user-a@example.com");
        String plannerId = createPlanner(token, "User A Planner");

        String ownerEmail = plannerRepository.findById(plannerId)
                .orElseThrow()
                .getOwner()
                .getEmail();

        assertThat(ownerEmail).isEqualTo("user-a@example.com");
    }

    @Test
    void shouldListOnlyCurrentUserPlanners() throws Exception {
        String userAToken = registerAndGetToken("user-a@example.com");
        String userBToken = registerAndGetToken("user-b@example.com");
        createPlanner(userAToken, "User A Planner");
        createPlanner(userBToken, "User B Planner");

        mockMvc.perform(get("/api/v1/planners/all")
                        .header(HttpHeaders.AUTHORIZATION, bearer(userAToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("User A Planner"));

        mockMvc.perform(get("/api/v1/planners/all")
                        .header(HttpHeaders.AUTHORIZATION, bearer(userBToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("User B Planner"));
    }

    @Test
    void shouldNotExposeOtherUsersPlannerById() throws Exception {
        String userAToken = registerAndGetToken("user-a@example.com");
        String userBToken = registerAndGetToken("user-b@example.com");
        String userAPlannerId = createPlanner(userAToken, "User A Planner");

        mockMvc.perform(get("/api/v1/planners/{id}", userAPlannerId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(userBToken)))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldLetOwnerUpdatePlannerNameAndNoteWithoutDeletingDuties() throws Exception {
        String token = registerAndGetToken("user-a@example.com");
        String plannerId = createPlanner(token, "User A Planner");
        createDuty(token, plannerId, "Existing Duty");

        mockMvc.perform(put("/api/v1/planners/{id}", plannerId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(plannerUpdatePayload(
                                "Updated Planner",
                                "Updated note",
                                "08:00:00",
                                "16:00:00",
                                false,
                                false
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Planner"))
                .andExpect(jsonPath("$.note").value("Updated note"))
                .andExpect(jsonPath("$.startTime").value("08:00:00"))
                .andExpect(jsonPath("$.endTime").value("16:00:00"))
                .andExpect(jsonPath("$.isConstant").value(false));

        assertThat(dutyRepository.findByPlannerId(plannerId))
                .extracting("name")
                .containsExactly("Existing Duty");
    }

    @Test
    void shouldRejectPlannerShapeUpdateWithDutiesWithoutConfirmation() throws Exception {
        String token = registerAndGetToken("user-a@example.com");
        String plannerId = createPlanner(token, "User A Planner");
        createDuty(token, plannerId, "Existing Duty");

        mockMvc.perform(put("/api/v1/planners/{id}", plannerId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(plannerUpdatePayload(
                                "Updated Planner",
                                "Updated note",
                                "07:00:00",
                                "16:00:00",
                                false,
                                null
                        )))
                .andExpect(status().isConflict())
                .andExpect(content().string(containsString("requires confirmation")));

        mockMvc.perform(put("/api/v1/planners/{id}", plannerId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(plannerUpdatePayload(
                                "Updated Planner",
                                "Updated note",
                                "07:00:00",
                                "16:00:00",
                                false,
                                false
                        )))
                .andExpect(status().isConflict())
                .andExpect(content().string(containsString("requires confirmation")));

        assertThat(dutyRepository.findByPlannerId(plannerId))
                .extracting("name")
                .containsExactly("Existing Duty");
    }

    @Test
    void shouldLetOwnerConfirmShapeUpdateAndDeleteDependentDuties() throws Exception {
        String token = registerAndGetToken("user-a@example.com");
        String plannerId = createPlanner(token, "User A Planner");
        createDuty(token, plannerId, "Duty To Delete");

        mockMvc.perform(put("/api/v1/planners/{id}", plannerId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(plannerUpdatePayload(
                                "Updated Planner",
                                "Updated note",
                                "07:00:00",
                                "16:00:00",
                                false,
                                true
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Planner"))
                .andExpect(jsonPath("$.startTime").value("07:00:00"));

        assertThat(dutyRepository.findByPlannerId(plannerId)).isEmpty();
    }

    @Test
    void shouldDeletePlannerAndDependentDutiesForOwner() throws Exception {
        String token = registerAndGetToken("user-a@example.com");
        String plannerId = createPlanner(token, "User A Planner");
        createDuty(token, plannerId, "Duty To Delete");

        mockMvc.perform(delete("/api/v1/planners/{id}", plannerId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isNoContent());

        assertThat(plannerRepository.findById(plannerId)).isEmpty();
        assertThat(dutyRepository.findByPlannerId(plannerId)).isEmpty();
    }

    @Test
    void shouldNotLetUserMutateAnotherUsersPlanner() throws Exception {
        String userAToken = registerAndGetToken("user-a@example.com");
        String userBToken = registerAndGetToken("user-b@example.com");
        String userAPlannerId = createPlanner(userAToken, "User A Planner");
        createDuty(userAToken, userAPlannerId, "User A Duty");

        mockMvc.perform(put("/api/v1/planners/{id}", userAPlannerId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(userBToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(plannerUpdatePayload(
                                "Injected Planner",
                                "Injected note",
                                "08:00:00",
                                "16:00:00",
                                false,
                                false
                        )))
                .andExpect(status().isNotFound())
                .andExpect(content().string(not(containsString("User A Duty"))));

        mockMvc.perform(delete("/api/v1/planners/{id}", userAPlannerId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(userBToken)))
                .andExpect(status().isNotFound())
                .andExpect(content().string(not(containsString("User A Duty"))));

        assertThat(plannerRepository.findById(userAPlannerId)).isPresent();
        assertThat(dutyRepository.findByPlannerId(userAPlannerId))
                .extracting("name")
                .containsExactly("User A Duty");
    }

    @Test
    void shouldRejectPlannerMutationWithoutToken() throws Exception {
        mockMvc.perform(put("/api/v1/planners/not-owned-planner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(plannerUpdatePayload(
                                "Unauthorized Planner",
                                "Unauthorized note",
                                "08:00:00",
                                "16:00:00",
                                false,
                                false
                        )))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(delete("/api/v1/planners/not-owned-planner"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldExposePlannerMutationRoutesInOpenApi() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/v1/planners/{id}'].put").exists())
                .andExpect(jsonPath("$.paths['/api/v1/planners/{id}'].delete").exists());
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
                .andExpect(jsonPath("$.name").value(name))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode planner = objectMapper.readTree(response);

        return planner.get("id").asText();
    }

    private void createDuty(String token, String plannerId, String name) throws Exception {
        mockMvc.perform(post("/api/v1/duties/{plannerId}", plannerId)
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
                                """.formatted(name)))
                .andExpect(status().isCreated());
    }

    private String plannerUpdatePayload(
            String name,
            String note,
            String startTime,
            String endTime,
            boolean isConstant,
            Boolean confirmDutyDeletionOnShapeChange
    ) {
        String confirmationProperty = confirmDutyDeletionOnShapeChange == null ? "" : """
                                  "confirmDutyDeletionOnShapeChange": %s,
                        """.formatted(confirmDutyDeletionOnShapeChange);

        return """
                {
                  "name": "%s",
                  "note": "%s",
                  "startTime": "%s",
                  "endTime": "%s",
                %s  "isConstant": %s
                }
                """.formatted(name, note, startTime, endTime, confirmationProperty, isConstant);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
