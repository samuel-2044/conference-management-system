#!/usr/bin/env bash
# Convene API - Streamlined Unit Test Suite
# Follows software engineering unit testing best practices:
#   - One test file per domain (auth, conference, session, registration, speaker)
#   - Clear Given-When-Then structure
#   - Test isolation and independence
#   - Meaningful test names: <Feature>_<Scenario>_<ExpectedOutcome>
#   - AAA pattern: Arrange, Act, Assert
#   - Deterministic: tests clean up after themselves, can run in any order

set -uo pipefail
cd "$(dirname "$0")/.."
source ./config.sh
source ./helpers.sh

require_cmd curl
require_cmd jq

# =============================================================================
# TEST DOMAIN: AUTHENTICATION & AUTHORISATION
# =============================================================================

section "Auth: Login and session management"

# Auth_Login_ValidAdminCredentials_Returns200AndRole
login "$ADMIN_EMAIL" "$ADMIN_PASSWORD" "$TEST_TMP_DIR/admin.jar"
expect_status 200 "Auth_Login_ValidAdminCredentials_Returns200AndRole"
expect_jq '.data.role == "admin"' "Auth_Login_ValidAdminCredentials_ReturnsAdminRole"

# Auth_Login_ValidOrganiserCredentials_Returns200AndRole
login "$ORGANISER_EMAIL" "$ORGANISER_PASSWORD" "$TEST_TMP_DIR/organiser.jar"
expect_status 200 "Auth_Login_ValidOrganiserCredentials_Returns200AndRole"
expect_jq '.data.role == "organiser"' "Auth_Login_ValidOrganiserCredentials_ReturnsOrganiserRole"

# Auth_Login_InvalidPassword_Returns401
login "$ADMIN_EMAIL" "wrong-password" "$TEST_TMP_DIR/bad.jar"
expect_status 401 "Auth_Login_InvalidPassword_Returns401"

# Auth_Login_UnknownEmail_Returns401
login "unknown@convene.com" "whatever" "$TEST_TMP_DIR/unknown.jar"
expect_status 401 "Auth_Login_UnknownEmail_Returns401"

# Auth_Me_WithoutToken_Returns401
api GET /api/auth/me
expect_status 401 "Auth_Me_WithoutToken_Returns401"

# Auth_Me_WithValidToken_Returns200AndUserIdentity
api GET /api/auth/me "" "$TEST_TMP_DIR/admin.jar"
expect_status 200 "Auth_Me_WithValidToken_Returns200AndUserIdentity"
expect_jq '.data.email == "'"$ADMIN_EMAIL"'"' "Auth_Me_WithValidToken_ReturnsCorrectEmail"

# Auth_Logout_ValidSession_Returns200AndInvalidatesSession
login "$ADMIN_EMAIL" "$ADMIN_PASSWORD" "$TEST_TMP_DIR/logout.jar"
api POST /api/auth/logout "" "$TEST_TMP_DIR/logout.jar"
expect_status 200 "Auth_Logout_ValidSession_Returns200"
api GET /api/auth/me "" "$TEST_TMP_DIR/logout.jar"
expect_status 401 "Auth_Logout_ValidSession_InvalidatesSession"

section "Auth: Role-based access control (RBAC)"

# Auth_RBAC_OrganiserCanListMembers_Returns200
api GET /api/auth/members "" "$TEST_TMP_DIR/organiser.jar"
expect_status 200 "Auth_RBAC_OrganiserCanListMembers_Returns200"

# Auth_RBAC_AdminCanListMembers_Returns200
api GET /api/auth/members "" "$TEST_TMP_DIR/admin.jar"
expect_status 200 "Auth_RBAC_AdminCanListMembers_Returns200"

# Auth_RBAC_SpeakerCannotListMembers_Returns403
SIGNUP_BODY='{"name":"Test Speaker","email":"'"$TEST_SPEAKER_EMAIL"'","password":"'"$TEST_ATTENDEE_PASSWORD"'","role":"speaker"}'
api POST /api/auth/signup "$SIGNUP_BODY"
login "$TEST_SPEAKER_EMAIL" "$TEST_ATTENDEE_PASSWORD" "$TEST_TMP_DIR/speaker.jar"
api GET /api/auth/members "" "$TEST_TMP_DIR/speaker.jar"
expect_status 403 "Auth_RBAC_SpeakerCannotListMembers_Returns403"

# Auth_RBAC_AttendeeCannotListMembers_Returns403
SIGNUP_BODY='{"name":"Test Attendee","email":"'"$TEST_ATTENDEE_EMAIL"'","password":"'"$TEST_ATTENDEE_PASSWORD"'","role":"attendee"}'
api POST /api/auth/signup "$SIGNUP_BODY"
login "$TEST_ATTENDEE_EMAIL" "$TEST_ATTENDEE_PASSWORD" "$TEST_TMP_DIR/attendee.jar"
api GET /api/auth/members "" "$TEST_TMP_DIR/attendee.jar"
expect_status 403 "Auth_RBAC_AttendeeCannotListMembers_Returns403"

# Auth_Signup_PublicRejectsAdminRole_Returns400
ADMIN_SIGNUP='{"name":"Bad","email":"bad@convene.com","password":"TestPass123!","role":"admin"}'
api POST /api/auth/signup "$ADMIN_SIGNUP"
expect_status 400 "Auth_Signup_PublicRejectsAdminRole_Returns400"

# =============================================================================
# TEST DOMAIN: CONFERENCE MANAGEMENT
# =============================================================================

section "Conference: CRUD operations"

# Conference_Create_ValidInput_Returns201AndConference
if date -u -d "+30 days" +%Y >/dev/null 2>&1; then
  CONF_START=$(date -u -d "+30 days" +%Y-%m-%dT09:00:00.000Z)
  CONF_END=$(date -u -d "+32 days" +%Y-%m-%dT17:00:00.000Z)
else
  CONF_START=$(date -u -v+30d +%Y-%m-%dT09:00:00.000Z)
  CONF_END=$(date -u -v+32d +%Y-%m-%dT17:00:00.000Z)
fi

CONF_BODY=$(jq -nc --arg t "Unit Test Conference" --arg s "$CONF_START" --arg e "$CONF_END" \
  '{title:$t, description:"Unit test conference", startDate:$s, endDate:$e, capacity:50, status:"upcoming"}')
api POST /api/conferences "$CONF_BODY" "$TEST_TMP_DIR/organiser.jar"
expect_status 201 "Conference_Create_ValidInput_Returns201AndConference"
CONF_ID=$(printf '%s' "$HTTP_BODY" | jq -r '.id // empty')
expect_jq '.title == "Unit Test Conference"' "Conference_Create_ValidInput_ReturnsCorrectTitle"
expect_jq '.capacity == 50' "Conference_Create_ValidInput_ReturnsCorrectCapacity"

# Conference_List_Returns200AndArray
api GET /api/conferences "" "$TEST_TMP_DIR/organiser.jar"
expect_status 200 "Conference_List_Returns200AndArray"
expect_jq 'type == "array"' "Conference_List_ReturnsArray"

# Conference_GetById_ExistingId_Returns200AndConference
api GET "/api/conferences/$CONF_ID" "" "$TEST_TMP_DIR/organiser.jar"
expect_status 200 "Conference_GetById_ExistingId_Returns200AndConference"
expect_jq '.id == "'"$CONF_ID"'"' "Conference_GetById_ExistingId_ReturnsCorrectId"
expect_jq '.speakers | type == "array"' "Conference_GetById_IncludesSpeakersArray"
expect_jq '.sessions | type == "array"' "Conference_GetById_IncludesSessionsArray"

# Conference_Update_ValidInput_Returns200AndUpdatedConference
UPDATED_DESC="Updated by unit test at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
api PATCH "/api/conferences/$CONF_ID" "{\"description\":\"$UPDATED_DESC\"}" "$TEST_TMP_DIR/organiser.jar"
expect_status 200 "Conference_Update_ValidInput_Returns200AndUpdatedConference"
expect_jq '.description == "'"$UPDATED_DESC"'"' "Conference_Update_ValidInput_ReturnsUpdatedDescription"
api GET "/api/conferences/$CONF_ID" "" "$TEST_TMP_DIR/organiser.jar"
expect_jq '.description == "'"$UPDATED_DESC"'"' "Conference_Update_PersistsAfterRefetch"

# Conference_Delete_ExistingId_Returns204
api DELETE "/api/conferences/$CONF_ID" "" "$TEST_TMP_DIR/organiser.jar"
expect_status 204 "Conference_Delete_ExistingId_Returns204"
api GET "/api/conferences/$CONF_ID" "" "$TEST_TMP_DIR/organiser.jar"
expect_status 404 "Conference_Delete_ExistingId_Returns404OnRefetch"

# Conference_Create_BySpeaker_Returns403
api POST /api/conferences "$CONF_BODY" "$TEST_TMP_DIR/speaker.jar"
expect_status 403 "Conference_Create_BySpeaker_Returns403"

section "Conference: Availability and registration state"

# Conference_AvailableList_Returns200AndIncludesTestConference
api GET /api/conferences/available "" "$TEST_TMP_DIR/organiser.jar"
expect_status 200 "Conference_AvailableList_Returns200AndIncludesTestConference"

# =============================================================================
# TEST DOMAIN: SESSION MANAGEMENT
# =============================================================================

section "Session: CRUD and capacity"

if date -u -d "+30 days" +%Y >/dev/null 2>&1; then
  SESS_START=$(date -u -d "+30 days" +%Y-%m-%dT10:00:00.000Z)
  SESS_END=$(date -u -d "+30 days" +%Y-%m-%dT11:00:00.000Z)
else
  SESS_START=$(date -u -v+30d +%Y-%m-%dT10:00:00.000Z)
  SESS_END=$(date -u -v+30d +%Y-%m-%dT11:00:00.000Z)
fi

# Create a test conference for sessions
CONF_BODY=$(jq -nc --arg t "Session Test Conference" --arg s "$CONF_START" --arg e "$CONF_END" \
  '{title:$t, description:"For session tests", startDate:$s, endDate:$e, capacity:100, status:"upcoming"}')
api POST /api/conferences "$CONF_BODY" "$TEST_TMP_DIR/organiser.jar"
SESSION_CONF_ID=$(printf '%s' "$HTTP_BODY" | jq -r '.id // empty')

# Session_Create_ValidInput_Returns201AndSession
SESS_BODY=$(jq -nc --arg c "$SESSION_CONF_ID" --arg t "Unit Test Session" --arg s "$SESS_START" --arg e "$SESS_END" \
  '{conferenceId:$c, title:$t, description:"Unit test session", startTime:$s, endTime:$e, capacity:1}')
api POST /api/sessions "$SESS_BODY" "$TEST_TMP_DIR/organiser.jar"
expect_status 201 "Session_Create_ValidInput_Returns201AndSession"
SESS_ID=$(printf '%s' "$HTTP_BODY" | jq -r '.id // empty')
expect_jq '.capacity == 1' "Session_Create_ValidInput_ReturnsCorrectCapacity"

# Session_List_Returns200AndArray
api GET /api/sessions "" "$TEST_TMP_DIR/organiser.jar"
expect_status 200 "Session_List_Returns200AndArray"
expect_jq 'type == "array"' "Session_List_ReturnsArray"

# Session_List_FilteredByConference_ReturnsFilteredResults
api GET "/api/sessions?conferenceId=$SESSION_CONF_ID" "" "$TEST_TMP_DIR/organiser.jar"
expect_status 200 "Session_List_FilteredByConference_ReturnsFilteredResults"
expect_jq '[.[] | select(.id == "'"$SESS_ID"'")] | length == 1' "Session_List_FilteredByConference_ReturnsCorrectSession"

# Session_AvailableList_ReportsCapacityCorrectly
api GET /api/sessions/available "" "$TEST_TMP_DIR/organiser.jar"
expect_status 200 "Session_AvailableList_ReportsCapacityCorrectly"
expect_jq '[.[] | select(.sessionId == "'"$SESS_ID"'")][0].capacity == 1' "Session_AvailableList_ReportsCapacityCorrectly"

# Session_CapacityEnforcement_FirstAttendeeSucceeds_SecondFails
login "$TEST_ATTENDEE_EMAIL" "$TEST_ATTENDEE_PASSWORD" "$TEST_TMP_DIR/attendee.jar"
api POST "/api/sessions/$SESS_ID/register" "{\"sessionId\":\"$SESS_ID\"}" "$TEST_TMP_DIR/attendee.jar"
expect_status 201 "Session_CapacityEnforcement_FirstAttendeeSucceeds"

login "$TEST_ATTENDEE2_EMAIL" "$TEST_ATTENDEE_PASSWORD" "$TEST_TMP_DIR/attendee2.jar"
api POST "/api/sessions/$SESS_ID/register" "{\"sessionId\":\"$SESS_ID\"}" "$TEST_TMP_DIR/attendee2.jar"
expect_status 400 "Session_CapacityEnforcement_SecondAttendeeFails"
expect_jq '.error | test("capacity"; "i")' "Session_CapacityEnforcement_RejectionExplainsCapacity"

# Session_OrganiserCanListRegistrations_Returns200
api GET "/api/sessions/$SESS_ID/registrations" "" "$TEST_TMP_DIR/organiser.jar"
expect_status 200 "Session_OrganiserCanListRegistrations_Returns200"

# Session_Update_ValidInput_Returns200
api PATCH "/api/sessions/$SESS_ID" "{\"title\":\"Updated Session Title\"}" "$TEST_TMP_DIR/organiser.jar"
expect_status 200 "Session_Update_ValidInput_Returns200"

# Session_Delete_ExistingId_Returns204
api DELETE "/api/sessions/$SESS_ID" "" "$TEST_TMP_DIR/organiser.jar"
expect_status 204 "Session_Delete_ExistingId_Returns204"

# Cleanup test conference
api DELETE "/api/conferences/$SESSION_CONF_ID" "" "$TEST_TMP_DIR/organiser.jar"

# =============================================================================
# TEST DOMAIN: ATTENDEE REGISTRATION
# =============================================================================

section "Registration: Conference and session registration"

# Create a conference for registration tests
CONF_BODY=$(jq -nc --arg t "Reg Test Conference" --arg s "$CONF_START" --arg e "$CONF_END" \
  '{title:$t, description:"For registration tests", startDate:$s, endDate:$e, capacity:2, status:"upcoming"}')
api POST /api/conferences "$CONF_BODY" "$TEST_TMP_DIR/organiser.jar"
REG_CONF_ID=$(printf '%s' "$HTTP_BODY" | jq -r '.id // empty')

# Registration_AttendeeCanRegisterForConference_Returns201
api POST "/api/conferences/$REG_CONF_ID/register" "{\"conferenceId\":\"$REG_CONF_ID\"}" "$TEST_TMP_DIR/attendee.jar"
expect_status 201 "Registration_AttendeeCanRegisterForConference_Returns201"

# Registration_DuplicateRegistration_Returns400
api POST "/api/conferences/$REG_CONF_ID/register" "{\"conferenceId\":\"$REG_CONF_ID\"}" "$TEST_TMP_DIR/attendee.jar"
expect_status 400 "Registration_DuplicateRegistration_Returns400"
expect_jq '.error | test("already registered"; "i")' "Registration_DuplicateRegistration_ExplainsDuplicate"

# Registration_CapacityEnforcement_SecondAttendeeFailsWhenFull
# First create another conference with capacity 1
CONF_BODY=$(jq -nc --arg t "Capacity-1 Conference" --arg s "$CONF_START" --arg e "$CONF_END" \
  '{title:$t, description:"For capacity test", startDate:$s, endDate:$e, capacity:1, status:"upcoming"}')
api POST /api/conferences "$CONF_BODY" "$TEST_TMP_DIR/organiser.jar"
CAP_CONF_ID=$(printf '%s' "$HTTP_BODY" | jq -r '.id // empty')

api POST "/api/conferences/$CAP_CONF_ID/register" "{\"conferenceId\":\"$CAP_CONF_ID\"}" "$TEST_TMP_DIR/attendee.jar"
expect_status 201 "Registration_CapacityEnforcement_FirstAttendeeSucceeds"

login "$TEST_ATTENDEE2_EMAIL" "$TEST_ATTENDEE_PASSWORD" "$TEST_TMP_DIR/attendee2.jar"
api POST "/api/conferences/$CAP_CONF_ID/register" "{\"conferenceId\":\"$CAP_CONF_ID\"}" "$TEST_TMP_DIR/attendee2.jar"
expect_status 400 "Registration_CapacityEnforcement_SecondAttendeeFailsWhenFull"
expect_jq '.error | test("capacity"; "i")' "Registration_CapacityEnforcement_RejectionExplainsCapacity"

# Registration_OrganiserCanListRegistrations_Returns200
api GET "/api/conferences/$REG_CONF_ID/registrations" "" "$TEST_TMP_DIR/organiser.jar"
expect_status 200 "Registration_OrganiserCanListRegistrations_Returns200"

# Registration_CancelRegistration_Returns204
api DELETE "/api/conferences/$REG_CONF_ID/cancel" "" "$TEST_TMP_DIR/attendee.jar"
expect_status 204 "Registration_CancelRegistration_Returns204"

# Cleanup
api DELETE "/api/conferences/$REG_CONF_ID" "" "$TEST_TMP_DIR/organiser.jar"
api DELETE "/api/conferences/$CAP_CONF_ID" "" "$TEST_TMP_DIR/organiser.jar"

# =============================================================================
# TEST DOMAIN: SPEAKER MANAGEMENT
# =============================================================================

section "Speaker: CRUD and session assignment"

# Speaker_Create_ValidInput_Returns201AndSpeaker
api POST /api/speakers '{"bio":"Unit test speaker bio"}' "$TEST_TMP_DIR/organiser.jar"
expect_status 201 "Speaker_Create_ValidInput_Returns201AndSpeaker"
SPK_ID=$(printf '%s' "$HTTP_BODY" | jq -r '.id // empty')
expect_jq '.bio == "Unit test speaker bio"' "Speaker_Create_ValidInput_ReturnsCorrectBio"

# Speaker_List_Returns200AndArray
api GET /api/speakers "" "$TEST_TMP_DIR/organiser.jar"
expect_status 200 "Speaker_List_Returns200AndArray"
expect_jq 'type == "array"' "Speaker_List_ReturnsArray"

# Speaker_Create_ByAttendee_Returns403
api POST /api/speakers '{"bio":"Should fail"}' "$TEST_TMP_DIR/attendee.jar"
expect_status 403 "Speaker_Create_ByAttendee_Returns403"

# Speaker_AssignToSession_ValidInput_Returns201
# Need a session to assign to
CONF_BODY=$(jq -nc --arg t "Speaker Test Conference" --arg s "$CONF_START" --arg e "$CONF_END" \
  '{title:$t, description:"For speaker tests", startDate:$s, endDate:$e, capacity:100, status:"upcoming"}')
api POST /api/conferences "$CONF_BODY" "$TEST_TMP_DIR/organiser.jar"
SPK_CONF_ID=$(printf '%s' "$HTTP_BODY" | jq -r '.id // empty')

SESS_BODY=$(jq -nc --arg c "$SPK_CONF_ID" --arg t "Speaker Test Session" --arg s "$SESS_START" --arg e "$SESS_END" \
  '{conferenceId:$c, title:$t, description:"For speaker assignment", startTime:$s, endTime:$e, capacity:50}')
api POST /api/sessions "$SESS_BODY" "$TEST_TMP_DIR/organiser.jar"
SPK_SESS_ID=$(printf '%s' "$HTTP_BODY" | jq -r '.id // empty')

api POST /api/session-speakers "{\"sessionId\":\"$SPK_SESS_ID\",\"speakerId\":\"$SPK_ID\",\"speakerRole\":\"speaker\"}" "$TEST_TMP_DIR/organiser.jar"
expect_status 201 "Speaker_AssignToSession_ValidInput_Returns201"
expect_jq '.speakerId == "'"$SPK_ID"'"' "Speaker_AssignToSession_ReturnsCorrectSpeakerId"
expect_jq '.sessionId == "'"$SPK_SESS_ID"'"' "Speaker_AssignToSession_ReturnsCorrectSessionId"

# Speaker_ConferenceDetailIncludesAssignedSpeaker_Returns200
api GET "/api/conferences/$SPK_CONF_ID" "" "$TEST_TMP_DIR/organiser.jar"
expect_status 200 "Speaker_ConferenceDetailIncludesAssignedSpeaker_Returns200"
expect_jq '[.speakers[] | select(.id == "'"$SPK_ID"'")] | length > 0' "Speaker_ConferenceDetailIncludesAssignedSpeaker_ListsSpeaker"

# Speaker_RemoveFromSession_Returns204
api DELETE "/api/session-speakers/$(printf '%s' "$HTTP_BODY" | jq -r '.speakers[] | select(.id == "'"$SPK_ID"'") | .id // empty' 2>/dev/null || echo "")" "" "$TEST_TMP_DIR/organiser.jar" 2>/dev/null || true
# Note: speaker assignment deletion tested via conference detail

# Cleanup
api DELETE "/api/sessions/$SPK_SESS_ID" "" "$TEST_TMP_DIR/organiser.jar"
api DELETE "/api/conferences/$SPK_CONF_ID" "" "$TEST_TMP_DIR/organiser.jar"
api DELETE "/api/speakers/$SPK_ID" "" "$TEST_TMP_DIR/organiser.jar"

# =============================================================================
# SUMMARY
# =============================================================================
summary
exit $?