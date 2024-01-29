package org.kaiteki.backend.teams.model.entity;


import jakarta.persistence.*;
import lombok.*;
import org.kaiteki.backend.users.models.Users;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "teams")
public class Teams {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "created_date", nullable = false)
    private ZonedDateTime createdDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id")
    private Users owner;

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL)
    private Set<TeamMembers> members;

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL)
    private List<TeamsPerformance> performances;
}
