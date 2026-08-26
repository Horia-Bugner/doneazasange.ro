<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_name('fdbs_contact');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => $secure,
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

function respond(int $status, array $payload) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function clean_header(string $value): string {
    return trim(str_replace(["\r", "\n"], ' ', $value));
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && ($_GET['action'] ?? '') === 'captcha') {
    $a = random_int(2, 9);
    $b = random_int(1, 9);
    $_SESSION['contact_captcha'] = $a + $b;
    $_SESSION['contact_captcha_time'] = time();
    respond(200, ['question' => "$a + $b"]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['error' => 'Metodă nepermisă.']);
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = $_SERVER['HTTP_HOST'] ?? '';
if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== preg_replace('/:\d+$/', '', $host)) {
    respond(403, ['error' => 'Cerere nepermisă.']);
}

$raw = file_get_contents('php://input');
$input = json_decode($raw ?: '', true);
if (!is_array($input)) {
    respond(400, ['error' => 'Datele formularului nu sunt valide.']);
}

if (trim((string)($input['website'] ?? '')) !== '') {
    respond(200, ['success' => true]);
}

$name = trim((string)($input['name'] ?? ''));
$email = trim((string)($input['email'] ?? ''));
$subject = clean_header((string)($input['subject'] ?? ''));
$message = trim((string)($input['message'] ?? ''));
$captcha = filter_var($input['captcha'] ?? null, FILTER_VALIDATE_INT);

if (mb_strlen($name) < 2 || mb_strlen($name) > 100) {
    respond(422, ['error' => 'Completează un nume valid.']);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) {
    respond(422, ['error' => 'Completează o adresă de e-mail validă.']);
}
if (mb_strlen($subject) < 2 || mb_strlen($subject) > 150) {
    respond(422, ['error' => 'Completează subiectul mesajului.']);
}
if (mb_strlen($message) < 10 || mb_strlen($message) > 5000) {
    respond(422, ['error' => 'Mesajul trebuie să conțină între 10 și 5000 de caractere.']);
}

$expected = $_SESSION['contact_captcha'] ?? null;
$captchaTime = (int)($_SESSION['contact_captcha_time'] ?? 0);
unset($_SESSION['contact_captcha'], $_SESSION['contact_captcha_time']);
if ($expected === null || $captcha === false || $captcha !== $expected || time() - $captchaTime > 900) {
    respond(422, ['error' => 'Răspunsul CAPTCHA nu este corect sau a expirat.']);
}

$lastSent = (int)($_SESSION['contact_last_sent'] ?? 0);
if (time() - $lastSent < 30) {
    respond(429, ['error' => 'Așteaptă puțin înainte de a trimite un alt mesaj.']);
}

$to = 'contact@doneazasange.ro';
$encodedSubject = '=?UTF-8?B?' . base64_encode('[Site FDBS] ' . $subject) . '?=';
$body = "Mesaj trimis prin formularul de contact doneazasange.ro\n\n"
      . "Nume: $name\n"
      . "E-mail: $email\n"
      . "Subiect: $subject\n\n"
      . "Mesaj:\n$message\n";
$headers = [
    'From: Site FDBS <contact@doneazasange.ro>',
    'Reply-To: ' . clean_header($email),
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
];

if (!mail($to, $encodedSubject, $body, implode("\r\n", $headers))) {
    respond(502, ['error' => 'Mesajul nu a putut fi trimis. Te rugăm să încerci din nou.']);
}

$_SESSION['contact_last_sent'] = time();
respond(200, ['success' => true]);

