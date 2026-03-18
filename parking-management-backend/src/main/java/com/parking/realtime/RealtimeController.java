package com.parking.realtime;

import com.parking.config.TenantContext;
import com.parking.parking.ParkingService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class RealtimeController {

    private final ParkingService parkingService;

    /**
     * Clients can send a ping to /app/ping to verify connection.
     * Response is broadcast to /topic/pong.
     */
    @MessageMapping("/ping")
    @SendTo("/topic/pong")
    public String ping(String tenantId) {
        return "pong:" + tenantId;
    }

    /**
     * Client subscribes to /app/availability/{lotId}
     * and receives the current availability snapshot on connect.
     */
    @MessageMapping("/availability")
    public void requestAvailability(String lotId) {
        try {
            parkingService.getAvailability(UUID.fromString(lotId));
        } catch (Exception ignored) {}
    }
}
