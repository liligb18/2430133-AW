<?php
// php/security.php - CSRF helpers and simple brute-force protection
// Asegurar cookies de sesión (httponly, secure si HTTPS, SameSite=Lax)
session_set_cookie_params([
    'httponly' => true,
    'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
    'samesite' => 'Lax'
]);

if (session_status() === PHP_SESSION_NONE) session_start();

function generate_csrf_token() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validate_csrf_token($token) {
    if (empty($token) || empty($_SESSION['csrf_token'])) return false;
    return hash_equals($_SESSION['csrf_token'], $token);
}

function get_login_attempts_file() {
    return sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'login_attempts.json';
}

function load_attempts() {
    $f = get_login_attempts_file();
    if (!file_exists($f)) return [];
    $json = @file_get_contents($f);
    if (!$json) return [];
    $data = json_decode($json, true);
    return is_array($data) ? $data : [];
}

function save_attempts(array $data) {
    $f = get_login_attempts_file();
    @file_put_contents($f, json_encode($data), LOCK_EX);
}

function record_failed_login($key) {
    $data = load_attempts();
    $now = time();
    if (!isset($data[$key])) {
        $data[$key] = ['count' => 1, 'first' => $now, 'blocked_until' => 0];
    } else {
        $data[$key]['count'] = ($data[$key]['count'] ?? 0) + 1;
    }
    // If more than 5 attempts within 15 minutes, block for 15 minutes
    $first = $data[$key]['first'] ?? $now;
    if (($data[$key]['count'] ?? 0) >= 5 && ($now - $first) <= 15 * 60) {
        $data[$key]['blocked_until'] = $now + 15 * 60;
    }
    save_attempts($data);
}

function reset_login_attempts($key) {
    $data = load_attempts();
    if (isset($data[$key])) { unset($data[$key]); save_attempts($data); }
}

function is_login_blocked($key) {
    $data = load_attempts();
    if (empty($data[$key])) return false;
    $now = time();
    $blocked = $data[$key]['blocked_until'] ?? 0;
    if ($blocked && $now < $blocked) return true;
    // If first attempt was long ago, reset
    $first = $data[$key]['first'] ?? 0;
    if ($now - $first > 24 * 60 * 60) { // older than 1 day
        reset_login_attempts($key);
        return false;
    }
    return false;
}

?>
