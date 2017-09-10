import randomstring from 'randomstring';
import randomWord from 'random-word-by-length';

const defaultPasswordConfig = {
    base: 'WORD',
    length: {
        min: 12,
        max: 16
    },
    capsLetters: {
        min: 3,
        max: 3
    },
    numerals: {
        min: 2,
        max: 2
    },
    spacialCharactors: {
        includes: [],
        min: 0,
        max: 0
    },
    spaces: {
        allow: false,
        min: 0,
        max: 0
    }
};
exports.getDefaultConfig = () => defaultPasswordConfig;
exports.generatePassword = (configs) => {
    configs = configs || defaultPasswordConfig;
    const passwordLength = generateRandomNumber(configs.length.min, configs.length.max),
        passwordWithoutApplyingConfigs = generateRandomText(configs.base, passwordLength),
        noOfCaps = generateRandomNumber(configs.capsLetters.min, configs.capsLetters.max),
        noOfNumerals = generateRandomNumber(configs.numerals.min, configs.numerals.max),
        noOfSpecialChars = generateRandomNumber(configs.spacialCharactors.min, configs.spacialCharactors.max),
        noOfSpaces = generateRandomNumber(configs.spaces.min, configs.spaces.max);

    let charTypes = findPositionsOfCharTypes(passwordWithoutApplyingConfigs);

    // validate for required caps letters
    verifyCapsLetters(charTypes.capsLetters, noOfCaps, charTypes.lowerLetters);

    // validate for required numberals
    verifyNumerals(charTypes.numerals, noOfNumerals, charTypes.lowerLetters);

    // validate for required special charactors
    if (configs.spacialCharactors.includes.length > 0) {
        verifySpecialCharactors(charTypes.specials, noOfSpecialChars, charTypes.lowerLetters, configs.spacialCharactors.includes.join(''));
    }

    // validate for required spaces
    if (configs.spaces.allow) {
        verifySpaces(charTypes.spaces, noOfSpaces, charTypes.lowerLetters);
    }

    return joinGeneratedPassword(charTypes, passwordLength);
};

const generateRandomText = (type, length) => {
    switch (type) {
        case 'RANDOM':
            return randomstring.generate({length: length, charset: 'alphabetic'});
        default:
            return generateWordBasedText(length);
    }
};

const generateWordBasedText = (length) => {
    let text = '';

    while (text.length <= length) {
        text += randomWord();
    }
    return text.substring(0, length);
};

const generateRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

const findPositionsOfCharTypes = (text) => {
    let capsLetters = [],
        lowerLetters = [],
        numerals = [],
        spaces = [],
        specials = [];
    for (let i = 0; i < text.length; i++) {
        if (text[i].match(/[A-Z]/) !== null) {
            capsLetters.push({index: i, charactor: text[i]});
        } else {
            lowerLetters.push({index: i, charactor: text[i]});
        }
    }
    return {capsLetters, lowerLetters, numerals, spaces, specials};
};

const verifyCapsLetters = (capsCharset, noOfCaps, defaultCharset) => {
    if (capsCharset.length < noOfCaps) {
        handleLessCharsThanRequired(capsCharset, noOfCaps, defaultCharset, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    } else if (capsCharset.length > noOfCaps) {
        handleMoreCharsThanRequired(capsCharset, noOfCaps, defaultCharset);
    }
};

const verifyNumerals = (numeralCharset, noOfNumerals, defaultCharset) => {
    if (numeralCharset.length < noOfNumerals) {
        handleLessCharsThanRequired(numeralCharset, noOfNumerals, defaultCharset, '0123456789');
    } else if (numeralCharset.length > noOfNumerals) {
        handleMoreCharsThanRequired(numeralCharset, noOfNumerals, defaultCharset);
    }
};

const verifySpecialCharactors = (specialCharset, noOfSpecialChars, defaultCharset, includes) => {
    if (specialCharset.length < noOfSpecialChars) {
        handleLessCharsThanRequired(specialCharset, noOfSpecialChars, defaultCharset, includes);
    } else if (specialCharset.length > noOfSpecialChars) {
        handleMoreCharsThanRequired(specialCharset, noOfSpecialChars, defaultCharset);
    }
};

const verifySpaces = (spaceCharset, noOfSpaces, defaultCharset) => {
    if (spaceCharset.length < noOfSpaces) {
        handleLessCharsThanRequired(spaceCharset, noOfSpaces, defaultCharset, ' ');
    } else if (spaceCharset.length > noOfSpaces) {
        handleMoreCharsThanRequired(spaceCharset, noOfSpaces, defaultCharset);
    }
};

const handleMoreCharsThanRequired = (charset, noOfRequired, defaultCharset) => {
    let noOfElemToRemove = charset.length - noOfRequired;
    for (let i = 0; i < noOfElemToRemove; i++) {
        const randomIndex = generateRandomNumber(0, charset.length - 1);
        let elemToRemove = charset[randomIndex];
        charset.splice(randomIndex, 1);
        const newElem = {
                ...elemToRemove,
            charactor: randomstring.generate({length: 1, charset: 'alphabetic', capitalization: 'lowercase'})
    };
        defaultCharset.push(newElem);
    }
};

const handleLessCharsThanRequired = (charset, noOfRequired, defaultCharset, requiredCharset) => {
    let noOfElemToAdd = noOfRequired - charset.length;
    for (let i = 0; i < noOfElemToAdd; i++) {
        const randomIndex = generateRandomNumber(0, defaultCharset.length - 1);
        let elemToAdd = defaultCharset[randomIndex];
        defaultCharset.splice(randomIndex, 1);
        const newElem = {
                ...elemToAdd,
            charactor: randomstring.generate({length: 1, charset: requiredCharset})
    };
        charset.push(newElem);
    }
};

const joinGeneratedPassword = (charTypes, length) => {
    let generatedPassword = new Array(length);
    Object.entries(charTypes).forEach(([key, value]) => {
        value.forEach(v => {
        generatedPassword[v.index] = v.charactor;
});
});

    return generatedPassword.join('');
};