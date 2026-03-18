package com.parking.realtime;

import com.parking.parking.SlotStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class SlotUpdatePublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publish(String tenantId, UUID slotId, SlotStatus status) {
        if (tenantId == null) return;

        SlotUpdateMessage message = new SlotUpdateMessage(slotId.toString(), status.name());
        String destination = "/topic/tenant/" + tenantId + "/slots";

        messagingTemplate.convertAndSend(destination, message);
        log.debug("Published slot update: tenant={} slot={} status={}", tenantId, slotId, status);
    }

    public void publishNotification(String tenantId, String type, String message) {
        if (tenantId == null) return;

        NotificationMessage notification = new NotificationMessage(type, message,
                System.currentTimeMillis());
        String destination = "/topic/tenant/" + tenantId + "/notifications";
        messagingTemplate.convertAndSend(destination, notification);
    }

    public record SlotUpdateMessage(String slotId, String status) {}

    public record NotificationMessage(String type, String message, long timestamp) {}
}
