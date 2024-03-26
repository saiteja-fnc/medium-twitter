
let setupDetails = {};

const saveSetupDetails = (details) => {
    setupDetails = details;
};

const getSetupDetails = () => {
    return setupDetails;
};

module.exports = { saveSetupDetails, getSetupDetails };
