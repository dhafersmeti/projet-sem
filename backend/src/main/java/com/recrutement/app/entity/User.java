package com.recrutement.app.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column
    private Long candidateId;

    @Column(nullable = false)
    @Builder.Default
    private boolean firstLogin = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    @Column
    private String phone;

    public enum Role {
        ADMIN, RECRUITER, CANDIDATE
    }
}
