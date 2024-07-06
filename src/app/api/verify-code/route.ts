import dbConnect from "@/lib/dbConnect";
import userModel from "@/model/User";

export async function POST(request: Request) {
    await dbConnect;

    try {
        const {username, code} = await request.json();
        const decodedUsername = decodeURIComponent(username);
        const user = await userModel.findOne({
            username: decodedUsername
        })
        if(!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {
                    status: 500
                }
            )
        }
        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();
            return Response.json(
                {
                    success: true,
                    message: "account verified successfully"
                },
                {
                    status: 200
                }
            )
        } else if (!isCodeNotExpired) {
            return Response.json(
                {
                    success: false,
                    message: "code has been expired, please signup again to get new verification code"
                },
                {
                    status: 400
                }
            )
        } else {
            return Response.json(
                {
                    success: false,
                    message: "incorrect verification code"
                },
                {
                    status: 400
                }
            )
        }
    } catch (error) {
        console.log("Error verifing user", error);
        return Response.json(
            {
                success: false,
                message: "Error verifing user"
            },
            {
                status: 500
            }
        )
    }
}