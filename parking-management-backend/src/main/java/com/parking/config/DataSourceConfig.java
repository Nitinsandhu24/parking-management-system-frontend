package com.parking.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUsername;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    /**
     * Creates a datasource for a given schema name.
     * Each tenant maps to its own PostgreSQL schema.
     */
    public DataSource buildDataSourceForSchema(String schema) {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(dbUrl);
        config.setUsername(dbUsername);
        config.setPassword(dbPassword);
        config.setConnectionInitSql("SET search_path TO " + schema);
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setPoolName("pool-" + schema);
        return new HikariDataSource(config);
    }

    @Bean
    @Primary
    public DataSource dataSource() {
        MultiTenantDataSource routingDataSource = new MultiTenantDataSource();

        // Master schema is the default target
        DataSource masterDs = buildDataSourceForSchema("master");
        Map<Object, Object> targetDataSources = new HashMap<>();
        targetDataSources.put("master", masterDs);

        routingDataSource.setTargetDataSources(targetDataSources);
        routingDataSource.setDefaultTargetDataSource(masterDs);
        routingDataSource.afterPropertiesSet();

        return routingDataSource;
    }
}
