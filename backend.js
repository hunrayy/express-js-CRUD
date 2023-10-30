const express = require("express");
const mongodb = require("mongodb");
const cors = require("cors")

require("dotenv").config(); 

//connect to the database

//1 Create a client 
const client = new mongodb.MongoClient(process.env.DB_URL)

//create the server
const server = express();

server.use(cors())
server.use(express.json());

//define the PORT 
const PORT = process.env.PORT;



//define the endpoints 

server.get("/check-api", function(request, response){

    response.send({
        message: "everything works fine",
        code: "success"
    })

});


server.post("/register-user", async function(request, response){

    console.log(request.body)

    let firstname = request.body.firstname;
    let lastname = request.body.lastname;
    let username = request.body.username;
    let password = request.body.password;

    //prepare the data to insert
    const user = {
        firstname: firstname,
        lastname: lastname,
        username: username,
        password: password
    }

    //register the user
    

    try{
        const feedback = await client.db(process.env.DB_NAME).collection(process.env.USERS_TB).insertOne(user);


        if(feedback){
            return response.send({
                message: "User registered successfully!",
                code: "reg-success",
                data: null
            })
        }
    
    
    
        return response.send({
            message: "Could not register the user.",
            code: "reg-error",
            data: null
        })
        
    }catch(error){
        console.error(error)
    }
})


//delete user account 
server.post("/delete-user", async (request, response) => {
    // this expects the username of the user that we want to delete
    let username = request.body.username;

    const feedback = await client.db(process.env.DB_NAME).collection(process.env.USERS_TB).deleteOne({ username: username})


    if(feedback){
        try{
            //look for the deleted count
        let number_deleted = feedback.deletedCount;
        console.log("deletion in process")
        if(number_deleted > 0){
            return response.send({
                message: "User's account was deleted successfully!",
                code: "deletion-success",
                data: feedback 
            })
        }

        return response.send({
            message: "User account could not be deleted. Either it does not exist or network error",
            code: "deletion-error",
            data: null
    
        })
        }catch(error){
            console.error(error)
        }
        

       

    }

    return response.send({
        message: "User account could not be deleted. Either it does not exist or network error",
        code: "deletion-error",
        data: null

    })

})

//update the user
server.post("/update-user", async(request, response) => {

    let username = request.body.username;
    let new_username = request.body.new_username;

    const feedback = await client.db(process.env.DB_NAME).collection(process.env.USERS_TB).updateOne({ username: username }, { $set: { username: new_username } })

    if(feedback){

        if(feedback.modifiedCount > 0){
            // we updated a user
            return response.send({
                message: "User updated",
                code: "update-success",
                data: feedback
            });
        }


        return response.send({
            message: "User does not exist. No record was updated",
            code: "update-error",
            data: null
        })
       

    }

    return response.send({
        message: "Could not update user's records",
        code: "update-error",
        data: null
    })

})



//server should be listening
server.listen(PORT, () => console.log(`Server is listening on PORT ${PORT}`));




