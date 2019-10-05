const { assert } = require('chai');

const getUserByEmail = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  describe('getUserByEmail', function() {
    it('should return a user object with valid email', function() {
      const actual = getUserByEmail("user@example.com", testUsers);
      const expectedOutput = {
        id: "userRandomID", 
        email: "user@example.com", 
        password: "purple-monkey-dinosaur"
      };
      // Write your assert statement here
      assert.deepEqual(actual, expectedOutput);
      assert.equal(actual.email, expectedOutput.email)
    });
    it('it should return undefined if the user is not in the database', function() {
      const actual = getUserByEmail("a@g.com", testUsers);
      const expectedOutput = undefined;
      assert.equal(actual, expectedOutput)
    });
  });
});