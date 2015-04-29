// Include the module for creating sha crypts. use with sha1.digest('string')
var crypto = require('crypto');


// This is supposed to encrypt the passwords..

function NumberInHexAlphabet(Letter) {
    Alphabet = {"a":"1","b":"2","c":"3","d":"4","e":"5","f":"6","0":"7","1":"8","2":"9","3":"10","4":"11","5":"12","6":"13","7":"14","8":"15","9":"16"};    
    return Alphabet[Letter.toLowerCase()];
}


function saltedpasswords(PasswordFromUser, SaltLength, PasswordFromDB, NumberOfTimes) {
    var Salt = '';
    var SaltedCharacterArray = {};
    
    // Set some defaults
    if (typeof(PasswordFromDB) == 'undefined') {
        PasswordFromDB = false;
    }
    
    if (typeof(NumberOfTimes) == 'undefined') {
        NumberOfTimes = 2;
    }
    
    // Check if saltlength is a string or a number. If a string, set the saltlength to the length of the string.
    if (isNaN(SaltLength)) {
        SaltLength = SaltLength.length;   
    }
    
    // Build the Salt
    if (PasswordFromDB === false) {
       // console.log('PasswordFromDB is False');
        for (var i=0; i < SaltLength; i++) {
            Salt += '' + Salt + Math.floor((Math.random() * 10000) + 1);
        }
        var sha1 = crypto.createHash('sha1');
        sha1.update(Salt);
        digestedSalt = sha1.digest('hex');
        //console.log(digestedSalt);
        Salt = digestedSalt.substr(0,SaltLength).toLowerCase();
    } else {
        //console.log('PasswordFromDB is True');
        Salt = PasswordFromDB.substr(0,SaltLength)
    }
  // console.log('Salt: ' + Salt);
    
    /* PHP:
    

    
    */
    //console.log('Salt: ' + Salt);
    for (var NumberOfTimesDone=0; NumberOfTimesDone < NumberOfTimes; NumberOfTimesDone++) {
        // For each letter in the salt
        for (var i=0; i<Salt.length;i++) {
            
            //console.log(typeof(SaltedCharacterArray[Salt.charAt(i)]));
            
            if(typeof(SaltedCharacterArray[Salt.charAt(i)]) == 'undefined') {
                SaltedCharacterArray[Salt.charAt(i)] = 1
            } else {
                SaltedCharacterArray[Salt.charAt(i)] = SaltedCharacterArray[Salt.charAt(i)]+1;
            }
           // console.log(Salt.charAt(i) + " : " + SaltedCharacterArray[Salt.charAt(i)]);
            
            var GrainOfSalt = Salt.substr(i,1);
            var EndPosition = NumberInHexAlphabet(GrainOfSalt) * SaltedCharacterArray[Salt.charAt(i)];
            while(EndPosition > (PasswordFromUser.length+1)) {
                EndPosition = EndPosition/2;   
            }
            
            var Password_Start = PasswordFromUser.substr(0,EndPosition);
            var Password_End = PasswordFromUser.substr(Password_Start.length);
            PasswordFromUser = Password_Start + GrainOfSalt + Password_End;
        }
        if ( (NumberOfTimesDone < (NumberOfTimes-1)) || (NumberOfTimes<=1) ) {
            var sha1 = crypto.createHash('sha1');
            sha1.update(PasswordFromUser);
            PasswordFromUser = sha1.digest('hex');   
        }
    }
    
    //################################ SEE crypt - v2 PHP version, add salt at the position of salt length into the string ################
    //Lastly we add the $salt to the beginning of the resulting crypted hash, so we can encrypt another string and reach the same result.
	PasswordFromUser = Salt + PasswordFromUser;
	
    //If there was a $PasswordFromDatabase supplied we check if it matches our result. If none was provided, we return the encrypted string.
	if(!(PasswordFromDB === false)) {
		
		if (PasswordFromUser == PasswordFromDB) {
			return true;
		} else {
			return false;
		}
	} else {
		return PasswordFromUser;
	}
    
};

exports.saltedpasswords = saltedpasswords;