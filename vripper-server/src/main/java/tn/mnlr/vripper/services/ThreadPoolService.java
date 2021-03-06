package tn.mnlr.vripper.services;

import lombok.Getter;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Service
public class ThreadPoolService {
    @Getter
    private final ExecutorService generalExecutor = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors());

    public void destroy() throws Exception {
        generalExecutor.shutdown();
        generalExecutor.awaitTermination(5, TimeUnit.SECONDS);
    }
}
