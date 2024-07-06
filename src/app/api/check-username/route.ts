import userModel from "@/model/User";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import { usernameValidation } from "@/schema/signUpSchema";

const usernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect();
    try {
        const {searchParams} = new URL(request.url);
        const queryParams = {
            username: searchParams.get("username")
        }
        const result = usernameQuerySchema.safeParse(queryParams);
        console.log(result);    //remove it later!
        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || [];
            return Response.json(
                {
                    success: false,
                    message: usernameErrors.length < 0 ? usernameErrors.join(", ") : "Invalid query parameters"
                },
                {
                    status: 400
                }
            )
        }
        const { username } = result.data
        const existingVerifiedUser = await userModel.findOne({username, isVerified: true});
        if (existingVerifiedUser) {
            return Response.json(
                {
                    success: false,
                    message: "username is taken"
                },
                {
                    status: 400
                }
            )
        };
        return Response.json(
            {
                success: true,
                message: "username is available"
            },
            {
                status: 200
            }
        )
    } catch (error) {
        console.log("Error checking username", error);
        return Response.json(
            {
                success: false,
                message: "Error checking username"
            },
            {
                status: 500
            }
        )
    }
}