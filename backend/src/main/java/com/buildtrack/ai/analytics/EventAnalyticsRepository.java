package com.buildtrack.ai.analytics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventAnalyticsRepository extends JpaRepository<EventAnalytics, Long> {
}
