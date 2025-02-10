SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '30641467-0e8c-4c97-bc5a-0418e1cbfb31', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"superadmin@ecs.com","user_id":"41447a0e-7684-4108-9e20-4bf9abb65e3b","user_phone":""}}', '2025-02-08 01:22:16.188695+00', ''),
	('00000000-0000-0000-0000-000000000000', '8582ca27-8a0f-4748-8850-26dc3b14525e', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"admin-01@ecs.com","user_id":"9a8ade8c-2fb5-4a5a-babe-e7db78d46062","user_phone":""}}', '2025-02-08 01:35:53.216557+00', ''),
	('00000000-0000-0000-0000-000000000000', '42e16405-c3ef-4209-af1f-8717da8ef90c', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"employee-01@ecs.com","user_id":"93629b4f-9b79-48d7-b735-6a47efb09889","user_phone":""}}', '2025-02-08 01:36:21.676968+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '41447a0e-7684-4108-9e20-4bf9abb65e3b', 'authenticated', 'authenticated', 'superadmin@ecs.com', '$2a$10$ytZ3IMjzjPzGPWkzvqT2VuWBWqfyJFbt4q52uLQvjWvAoDvfIWMzi', '2025-02-08 01:22:16.189505+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-02-08 01:22:16.186155+00', '2025-02-08 01:22:16.189887+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '9a8ade8c-2fb5-4a5a-babe-e7db78d46062', 'authenticated', 'authenticated', 'admin-01@ecs.com', '$2a$10$SPZN/bfSXY3QvtMRCBn/xOzMbWgs3Q.ddbRdtx.eJeozolpye8N1q', '2025-02-08 01:35:53.217241+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-02-08 01:35:53.214467+00', '2025-02-08 01:35:53.217577+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '93629b4f-9b79-48d7-b735-6a47efb09889', 'authenticated', 'authenticated', 'employee-01@ecs.com', '$2a$10$TmxvfsTpvelacbJ/vrvOPeeM80gxq8dzs8hGTacHAmkEmHCrCoN0K', '2025-02-08 01:36:21.678429+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-02-08 01:36:21.676037+00', '2025-02-08 01:36:21.678961+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('41447a0e-7684-4108-9e20-4bf9abb65e3b', '41447a0e-7684-4108-9e20-4bf9abb65e3b', '{"sub": "41447a0e-7684-4108-9e20-4bf9abb65e3b", "email": "superadmin@ecs.com", "email_verified": false, "phone_verified": false}', 'email', '2025-02-08 01:22:16.188039+00', '2025-02-08 01:22:16.18806+00', '2025-02-08 01:22:16.18806+00', 'ad5d620c-144d-4dbe-a481-046caf283a75'),
	('9a8ade8c-2fb5-4a5a-babe-e7db78d46062', '9a8ade8c-2fb5-4a5a-babe-e7db78d46062', '{"sub": "9a8ade8c-2fb5-4a5a-babe-e7db78d46062", "email": "admin-01@ecs.com", "email_verified": false, "phone_verified": false}', 'email', '2025-02-08 01:35:53.216035+00', '2025-02-08 01:35:53.216058+00', '2025-02-08 01:35:53.216058+00', 'c41ef662-9fd7-4a94-a1c4-2231aa2ea4ac'),
	('93629b4f-9b79-48d7-b735-6a47efb09889', '93629b4f-9b79-48d7-b735-6a47efb09889', '{"sub": "93629b4f-9b79-48d7-b735-6a47efb09889", "email": "employee-01@ecs.com", "email_verified": false, "phone_verified": false}', 'email', '2025-02-08 01:36:21.676615+00', '2025-02-08 01:36:21.676646+00', '2025-02-08 01:36:21.676646+00', '70f44689-9ba6-4343-852e-5a49c208b765');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: key; Type: TABLE DATA; Schema: pgsodium; Owner: supabase_admin
--



--
-- Data for Name: claims; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."claims" ("id", "employee_id", "amount", "submitted_on", "approved_on") VALUES
	('b1e1e416-47b8-4a07-bc55-637e7d2ed1cf', '41447a0e-7684-4108-9e20-4bf9abb65e3b', 101.27, '2025-02-08 01:29:28.661556', NULL),
	('51fb13b1-15e0-4643-ac87-250d6aef97fb', '9a8ade8c-2fb5-4a5a-babe-e7db78d46062', 43.65, '2024-12-22 01:40:07.33852', '2025-02-07 21:40:56');


--
-- Data for Name: claims; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "email", "first_name", "last_name", "role") VALUES
	('41447a0e-7684-4108-9e20-4bf9abb65e3b', 'superadmin@ecs.com', 'Zero', null, 'superadmin'), 
	('93629b4f-9b79-48d7-b735-6a47efb09889', 'employee-01@ecs.com', 'Lloyd', 'Farnsworth', 'employee'), 
	('9a8ade8c-2fb5-4a5a-babe-e7db78d46062', 'admin-01@ecs.com', 'Suzie', 'Queue', 'admin');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: key_key_id_seq; Type: SEQUENCE SET; Schema: pgsodium; Owner: supabase_admin
--

SELECT pg_catalog.setval('"pgsodium"."key_key_id_seq"', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
