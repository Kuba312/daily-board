package com.dailyboard.dailyboard.controller;

import com.dailyboard.dailyboard.model.dto.AuthRequestDto;
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
class PlannerOwnershipTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PlannerRepository plannerRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
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

        org.assertj.core.api.Assertions.assertThat(ownerEmail).isEqualTo("user-a@example.com");
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

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
