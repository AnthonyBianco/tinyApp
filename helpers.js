//                     HELPER FUNCTION
//=============================================================

const getUserByEmail = function(email, users) {
  for (const userID in users){
    if (users[userID].email === email){
      return users[userID];
    }
  }
};

module.exports = getUserByEmail; 