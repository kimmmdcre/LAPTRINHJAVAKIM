package com.huy.spmtool.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "groups") //
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // 1 group có nhiều user
    @OneToMany(mappedBy = "group")
    private List<User> users;

    // 1 group có nhiều task
    @OneToMany(mappedBy = "group")
    private List<Task> tasks;
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<User> getUsers() {
        return users;
    }

    public List<Task> getTasks() {
        return tasks;
    }
}