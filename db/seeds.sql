-- -----------------------------------------------------------------------------------------------------------------------------------------
-- Insert a set of records into the surveys table.
-- -----------------------------------------------------------------------------------------------------------------------------------------

-- Create future surveys.
INSERT INTO surveys (surveyTitle, startTime, stopTime, createdAt, updatedAt, UserId) VALUES
('Where do you want to eat?', NOW() + INTERVAL 1 HOUR, NOW() + INTERVAL 2 HOUR, NOW(), NOW(), 1),
('Another survey!', NOW() + INTERVAL 1 HOUR, NOW() + INTERVAL 2 HOUR, NOW(), NOW(), 2),
('Where to shop?', NOW() + INTERVAL 1 HOUR, NOW() + INTERVAL 2 HOUR, NOW(), NOW(), 5),
('Where to stay?', NOW() + INTERVAL 1 HOUR, NOW() + INTERVAL 2 HOUR, NOW(), NOW(), 1);

-- Create active surveys.
INSERT INTO surveys (surveyTitle, startTime, stopTime, createdAt, updatedAt, UserId) VALUES
('Events for the night...', NOW() - INTERVAL 1 HOUR, NOW() + INTERVAL 30 MINUTE, NOW(), NOW(), 3),
('What else should we do?', NOW() - INTERVAL 1 HOUR, NOW() + INTERVAL 500 SECOND, NOW(), NOW(), 3),
('Yet another survey', NOW() - INTERVAL 1 HOUR, NOW() + INTERVAL 800 SECOND, NOW(), NOW(), 1),
('I love lamp', NOW() - INTERVAL 1 HOUR, NOW() + INTERVAL 1000 SECOND, NOW(), NOW(), 4);

-- Create expired surveys.
INSERT INTO surveys (surveyTitle, startTime, stopTime, createdAt, updatedAt, UserId) VALUES
('Where should we go hiking?', NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 1 HOUR, NOW(), NOW(), 1),
('What gym should we go to?', NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 1 HOUR, NOW(), NOW(), 7),
('Running out of survey topics...', NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 1 HOUR, NOW(), NOW(), 8),
('What movie should we see?', NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 1 HOUR, NOW(), NOW(), 9);

-- -----------------------------------------------------------------------------------------------------------------------------------------
-- Insert a set of records into the surveytakers table.
-- -----------------------------------------------------------------------------------------------------------------------------------------

-- Note that you should create and login with an account called "test" for testing purposes.
INSERT INTO surveytakers (username, isRead, isStarred, createdAt, updatedAt, SurveyId) VALUES
('test', false, false, NOW(), NOW(), 1),
('test', false, false, NOW(), NOW(), 2),
('test', false, false, NOW(), NOW(), 3),
('test', false, false, NOW(), NOW(), 4),
('test', false, false, NOW(), NOW(), 5),
('test', true, false, NOW(), NOW(), 6),
('test', false, false, NOW(), NOW(), 7),
('test', false, false, NOW(), NOW(), 8),
('test', false, false, NOW(), NOW(), 9),
('test', false, false, NOW(), NOW(), 10),
('test', false, true, NOW(), NOW(), 11),
('test', false, true, NOW(), NOW(), 12);

INSERT INTO surveytakers (username, isRead, isStarred, createdAt, updatedAt, SurveyId) VALUES
('Greg', false, false, NOW(), NOW(), 1),
('Greg', false, false, NOW(), NOW(), 2),
('Greg', false, false, NOW(), NOW(), 5),
('Greg', false, false, NOW(), NOW(), 6),
('Greg', false, false, NOW(), NOW(), 10);

INSERT INTO surveytakers (username, isRead, isStarred, createdAt, updatedAt, SurveyId) VALUES
('Hank', false, false, NOW(), NOW(), 5),
('Hank', false, false, NOW(), NOW(), 6),
('Hank', false, false, NOW(), NOW(), 7),
('Hank', false, false, NOW(), NOW(), 8);

INSERT INTO surveytakers (username, isRead, isStarred, createdAt, updatedAt, SurveyId) VALUES
('Hannah', false, false, NOW(), NOW(), 3),
('Hannah', false, false, NOW(), NOW(), 4),
('Hannah', false, false, NOW(), NOW(), 9),
('Hannah', false, false, NOW(), NOW(), 10),
('Hannah', false, false, NOW(), NOW(), 11),
('Hannah', false, false, NOW(), NOW(), 12);

INSERT INTO surveytakers (username, isRead, isStarred, createdAt, updatedAt, SurveyId) VALUES
('Jennifer', false, false, NOW(), NOW(), 1),
('Jennifer', false, false, NOW(), NOW(), 5),
('Jennifer', false, false, NOW(), NOW(), 9);

-- -----------------------------------------------------------------------------------------------------------------------------------------
-- Test survey.
-- -----------------------------------------------------------------------------------------------------------------------------------------

-- Create an active survey.
INSERT INTO surveys (surveyTitle, startTime, stopTime, createdAt, updatedAt, UserId) VALUES
('The super duper test survey!', NOW() - INTERVAL 1 HOUR, NOW() + INTERVAL 10 MINUTE, NOW(), NOW(), 3);

-- Add the survey takers.
INSERT INTO surveytakers (username, isRead, isStarred, createdAt, updatedAt, SurveyId) VALUES
('test'    , false, false, NOW(), NOW(), 13),
('Greg'    , false, false, NOW(), NOW(), 13),
('Hank'    , false, false, NOW(), NOW(), 13),
('Hannah'  , false, false, NOW(), NOW(), 13),
('Jennifer', false, false, NOW(), NOW(), 13);

-- Add the survey questions.
INSERT INTO surveyquestions (question, createdAt, updatedAt, SurveyId) VALUES
('Where should we go hiking today?'           , NOW(), NOW(), 13),
('Where should we eat after hiking?'          , NOW(), NOW(), 13),
('Where should we watch a movie after eating?', NOW(), NOW(), 13),
('Should we have another activity tomorrow?'  , NOW(), NOW(), 13),
('Was this survey helpful?'                   , NOW(), NOW(), 13);

-- Add the survey choices.
INSERT INTO surveychoices (description, isGoogle, selectedCount, latitude, longitude, surveyId, createdAt, updatedAt, SurveyQuestionId) VALUES
("The Living Room Trailhead" , true, 0, 40.7593145       , -111.8212911, 13, NOW(), NOW(), 1),
("Ensign Peak Trailhead"     , true, 0, 40.79179389999999, -111.8882277, 13, NOW(), NOW(), 1),
("Dry Gulch Trail Head"      , true, 0, 40.7776817       , -111.8372154, 13, NOW(), NOW(), 1),

("Julia's Mexican Restaurant", true, 0, 40.7678486       , -111.9194399, 13, NOW(), NOW(), 2),
("El Asadero Mexican Food"   , true, 0, 40.7712036       , -111.9203752, 13, NOW(), NOW(), 2),
("Red Iguana"                , true, 0, 40.7718527       , -111.912516 , 13, NOW(), NOW(), 2),

("Megaplex Theatres at The Gateway", true, 0, 40.76615700000001, -111.903684 , 13, NOW(), NOW(), 3),
("Century 16 Salt Lake and XD"     , true, 0, 40.7001907       , -111.8872638, 13, NOW(), NOW(), 3),
("Cinemark Sugarhouse"             , true, 0, 40.7222068       , -111.8576769, 13, NOW(), NOW(), 3),

("Yes", false, 0, null, null, 13, NOW(), NOW(), 4),

("Not helpful"     , false, 0, null, null, 13, NOW(), NOW(), 5),
("Somewhat helpful", false, 0, null, null, 13, NOW(), NOW(), 5),
("Helpful"         , false, 0, null, null, 13, NOW(), NOW(), 5),

("No" , false, 0, null, null, 13, NOW(), NOW(), 4),
("Bonneville Shoreline Trail", true, 0, 40.8049732       , -111.8880899, 13, NOW(), NOW(), 1),
("Tower Theatre"                   , true, 0, 40.7495678       , -111.8659653, 13, NOW(), NOW(), 3),
("Very helpful"    , false, 0, null, null, 13, NOW(), NOW(), 5),
("Chile-Tepin"               , true, 0, 40.76471799999999, -111.900093 , 13, NOW(), NOW(), 2);

-- Add survey responses.
INSERT INTO surveyresponses(username, surveyId, questionId, createdAt, updatedAt, SurveyChoiceId) VALUES
("test"    , 13, 5, NOW(), NOW(), 13),
("Jennifer", 13, 1, NOW(), NOW(), 2),
("test"    , 13, 2, NOW(), NOW(), 5),
("test"    , 13, 4, NOW(), NOW(), 14),
("test"    , 13, 1, NOW(), NOW(), 15),
("Hank"    , 13, 2, NOW(), NOW(), 6),
("Hannah"  , 13, 1, NOW(), NOW(), 2),
("Greg"    , 13, 1, NOW(), NOW(), 1),
("Greg"    , 13, 3, NOW(), NOW(), 7),
("Hank"    , 13, 1, NOW(), NOW(), 1),
("Hank"    , 13, 5, NOW(), NOW(), 17);

-- Add survey comments.
INSERT INTO surveycomments(comment, username, createdAt, updatedAt, SurveyId) VALUES
("I think the Ensign Peak Trailhead is cool.  Not sure about the others...", "Hank", NOW(), NOW(), 13),
("Tower theater sucks!"          , "Greg", NOW(), NOW(), 13),
("Epstein didn't kill himself!!!", "Hannah", NOW(), NOW(), 13),
("I love lamp!"                  , "test", NOW(), NOW(), 13);

-- Megaplex Theatres at The Gateway
-- { lat: 40.76615700000001, lng: -111.903684 }
-- Century 16 Salt Lake and XD
-- { lat: 40.7001907, lng: -111.8872638 }
-- Tower Theatre
-- { lat: 40.7495678, lng: -111.8659653 }
-- Cinemark Sugarhouse
-- { lat: 40.7222068, lng: -111.8576769 }

-- The Living Room Trailhead
-- { lat: 40.7593145, lng: -111.8212911 }
-- Ensign Peak Trailhead
-- { lat: 40.79179389999999, lng: -111.8882277 }
-- Dry Gulch Trail Head
-- { lat: 40.7776817, lng: -111.8372154 }
-- Bonneville Shoreline Trail
-- { lat: 40.8049732, lng: -111.8880899 }

-- Julia's Mexican Restaurant
-- { lat: 40.7678486, lng: -111.9194399 }
-- El Asadero Mexican Food
-- { lat: 40.7712036, lng: -111.9203752 }
-- Red Iguana
-- { lat: 40.7718527, lng: -111.912516 }
-- Chile-Tepin
-- { lat: 40.76471799999999, lng: -111.900093 }




