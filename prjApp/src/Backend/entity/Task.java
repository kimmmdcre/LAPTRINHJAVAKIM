package com.huy.spmtool.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "task") // Lưu ý tên bảng trong DB của bạn thường là số nhiều 'tasks'
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String description;

    private String status;
    @Column(name = "jira_issue_key")
    private String jiraIssueKey;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group group;

    // --- GETTER & SETTER (Huy copy kỹ đoạn này nhé) ---

    public Long getId() { return id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    // 3. Hàm này phải trả về String và return đúng biến jiraIssueKey
    public String getJiraIssueKey() {
        return jiraIssueKey;
    }
    public void setJiraIssueKey(String jiraIssueKey) {
        this.jiraIssueKey = jiraIssueKey;
    }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Group getGroup() { return group; }
    public void setGroup(Group group) { this.group = group; }
}