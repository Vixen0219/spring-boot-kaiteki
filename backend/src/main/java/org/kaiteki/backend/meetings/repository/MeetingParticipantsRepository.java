package org.kaiteki.backend.meetings.repository;

import org.kaiteki.backend.meetings.models.entity.MeetingParticipants;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MeetingParticipantsRepository extends
        JpaRepository<MeetingParticipants, Long>,
        PagingAndSortingRepository<MeetingParticipants, Long>,
        JpaSpecificationExecutor<MeetingParticipants> {

}
