package org.kaiteki.backend.activities.service;

import lombok.RequiredArgsConstructor;
import org.kaiteki.backend.activities.model.Activities;
import org.kaiteki.backend.activities.model.enums.ActivityType;
import org.kaiteki.backend.activities.repository.ActivitiesRepository;
import org.kaiteki.backend.teams.model.TeamMembers;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Calendar;
import java.util.Date;
import java.util.Optional;

import static java.util.Objects.isNull;

@Service
@RequiredArgsConstructor
public class ActivitiesService {
    private final ActivitiesRepository activitiesRepository;

    @Async
    public void processActivity(TeamMembers member, ActivityType type) {
        switch (type) {
            case CRITICAL_TASK -> processCriticalTaskActivity(member);
            case MEDIUM_TASK -> processMediumTaskActivity(member);
            case EASY_TASK -> processEasyTaskActivity(member);
            case MEETINGS_ATTENDANT -> processMeetingsActivity(member);
            case MESSAGES_SENT -> processMessagesActivity(member);
        }
    }

    private void processCriticalTaskActivity(TeamMembers member) {}

    private void processMediumTaskActivity(TeamMembers member) {}

    private void processEasyTaskActivity(TeamMembers member) {}

    private void processMeetingsActivity(TeamMembers member) {}

    private void processMessagesActivity(TeamMembers member) {}

    public Activities getLastActivity(TeamMembers teamMembers) {
        Activities lastActivity = activitiesRepository
                .findLastActivityByTeamMemberId(teamMembers.getId())
                .orElse(null);

        if (isNull(lastActivity) || shouldCreateNewActivity(lastActivity)) {
            return createActivity(teamMembers);
        }

        return lastActivity;
    }

    public boolean shouldCreateNewActivity(Activities lastActivity) {
        LocalDate currentDate = LocalDate.now();
        LocalDate lastActivityDate = lastActivity.getPeriodDate();

        int lastActivityMonth = lastActivityDate.getMonthValue();
        int currentMonth = currentDate.getMonthValue();

        return lastActivityMonth != currentMonth;
    }

    public Activities createActivity(TeamMembers teamMembers) {
        return activitiesRepository.save(
                Activities.builder()
                .periodDate(LocalDate.now())
                .attendantMeetingsCount(0)
                .criticalTasksCount(0)
                .easyTasksCount(0)
                .middleTasksCount(0)
                .messagesSentCount(0)
                .performance(0)
                .teamMember(teamMembers)
                .build()
        );
    }
}
