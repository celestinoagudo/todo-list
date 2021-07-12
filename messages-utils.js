let messageUtliities = {

    logSearchError: (name, error) => {
        console.log(`An error is encountered while searching for document named '${name}':'${error}'`);
    },
    logUpdateSuccess: (name) => {
        console.log(`Successfully updated the document named '${name}'`);
    },
    logUpdateError: (name, error) => {
        console.log(`An error is encountered while saving changes for document named '${name}': ${error}`);
    },
    logDocumentAlreadyExists: (name) => {
        console.log(`Document named '${name}' already exists`);
    },
    logDeleteError: (id, name) => {
        console.log(`An error is encountered while deleting document with id '${id}' and named '${name}'`);
    },
    logDeleteSuccess: (id, name) => {
        console.log(`Successfully deleted a document with id '${id}' and named '${name}'`);
    },
    logInsertSuccess: (name) => {
        console.log(`Successfully inserted new document named '${name}'`);
    },
    logInsertErrorMessage: (errorMessage) => {
        console.log(`An error is encountered while inserting record: '${errorMessage}'`);
    },
    logDocumentAlreadyExist: (name) => {
        console.log(`Item named '${name}' already exists`);
    },
    logFetchDataError: (error) => {
        console.log(`An error is encountered while fetching todo 
            items from the database. ${error}`);
    },



}

module.exports = messageUtliities;