use std::{
    collections::HashMap,
    sync::Mutex,
    time::{Duration, Instant},
};

/// Small fixed-window rate limiter kept in memory. Good enough for a
/// single-instance site; state resets on restart.
pub struct RateLimiter {
    max: u32,
    window: Duration,
    hits: Mutex<HashMap<String, (Instant, u32)>>,
}

const MAX_KEYS: usize = 10_000;

impl RateLimiter {
    pub fn new(max: u32, window: Duration) -> Self {
        Self {
            max,
            window,
            hits: Mutex::new(HashMap::new()),
        }
    }

    /// Records a hit for `key` and returns false when the limit is exceeded.
    pub fn check(&self, key: &str) -> bool {
        let now = Instant::now();
        let mut hits = self.hits.lock().unwrap_or_else(|e| e.into_inner());

        if hits.len() >= MAX_KEYS {
            hits.retain(|_, (start, _)| now.duration_since(*start) < self.window);
            if hits.len() >= MAX_KEYS {
                // Under a flood of distinct keys, fail closed rather than grow without bound.
                return false;
            }
        }

        let entry = hits.entry(key.to_string()).or_insert((now, 0));
        if now.duration_since(entry.0) >= self.window {
            *entry = (now, 0);
        }
        entry.1 += 1;
        entry.1 <= self.max
    }

    /// Forget a key (e.g. after a successful login).
    pub fn reset(&self, key: &str) {
        self.hits
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .remove(key);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn blocks_after_max_and_resets() {
        let rl = RateLimiter::new(2, Duration::from_secs(60));
        assert!(rl.check("a"));
        assert!(rl.check("a"));
        assert!(!rl.check("a"));
        assert!(rl.check("b"), "keys are independent");
        rl.reset("a");
        assert!(rl.check("a"));
    }

    #[test]
    fn window_expires() {
        let rl = RateLimiter::new(1, Duration::from_millis(20));
        assert!(rl.check("a"));
        assert!(!rl.check("a"));
        std::thread::sleep(Duration::from_millis(30));
        assert!(rl.check("a"));
    }
}
