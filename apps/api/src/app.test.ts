import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import app from './app.js';

test('health includes service and database status', async () => {
  const response = await request(app).get('/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.service, 'kurn-api');
  assert.equal(typeof response.body.data.database, 'boolean');
  assert.ok(response.headers['x-request-id']);
});

test('malformed JSON is rejected with a stable client error', async () => {
  const response = await request(app).post('/api/v1/auth/send-otp').set('content-type', 'application/json').send('{"phone":');
  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'INVALID_JSON');
});

test('gym discovery supports city filtering and demo provenance', async () => {
  const response = await request(app).get('/api/v1/gyms').query({ city: 'Bengaluru' });
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.ok(response.body.data.length > 0);
  assert.equal(response.body.data.every((gym: { city: string; demo: boolean }) => gym.city === 'Bengaluru' && gym.demo === true), true);
});

test('protected actions reject anonymous callers', async () => {
  const response = await request(app).post('/api/v1/bookings').send({ trainerId: 'trainer_demo_1', startsAt: new Date().toISOString(), endsAt: new Date(Date.now() + 3600000).toISOString(), amountPaise: 1000 });
  assert.equal(response.status, 401);
  assert.equal(response.body.error.code, 'UNAUTHENTICATED');
});

test('OTP development flow creates a session', async () => {
  process.env.OTP_PROVIDER = 'console';
  const phone = '+919111111111';
  const sent = await request(app).post('/api/v1/auth/send-otp').send({ phone });
  assert.equal(sent.status, 200);
  const verified = await request(app).post('/api/v1/auth/verify-otp').send({ phone, code: '123456' });
  assert.equal(verified.status, 200);
  assert.equal(typeof verified.body.data.token, 'string');
  assert.equal(verified.body.data.needsProfile, true);
});
