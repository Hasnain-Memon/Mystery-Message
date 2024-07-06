import userModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "next-auth";

export async function POST(request: Request){
    await dbConnect();

    const session = await getServerSession(authOptions);

    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json({
            succcess: false,
            message: "not authenticated"
        }, { status: 401 })
    }

    const userId = user._id;

    const {acceptMessags} = await request.json();

    try {
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            {
                isAcceptingMessage: acceptMessags,
            },
            {
                new: true
            }
        )

        if (!updatedUser) {
            return Response.json({
                succcess: false,
                message: "updated user not found"
            }, { status: 403 })
        }

        return Response.json({
            succcess: true,
            message: "Message acceptance status updated successfully",
            updatedUser
        }, { status: 200 })

    } catch (error) {
        console.log("failed to update user status to accept message", error);
        return Response.json({
            succcess: false,
            message: "failed to update user status to accept message"
        }, { status: 501 })
    }

}

export async function GET(request: Request){
    await dbConnect();

    const session = await getServerSession(authOptions);

    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json({
            succcess: false,
            message: "not authenticated"
        }, { status: 401 })
    }

    const userId = user._id;

    try {
        const foundUser = await userModel.findById(userId);
        
        if (!foundUser) {
            return Response.json({
                succcess: false,
                message: "user not found"
            }, { status: 404 })
        }
    
        return Response.json({
            succcess: true,
            isAcceptingMessage: foundUser.isAcceptingMessage
        }, { status: 200 })
    } catch (error) {
        console.log("Error in getting message acceptance status", error);
        return Response.json({
            succcess: false,
            message: "Error in getting message acceptance status"
        }, { status: 500 })
    }

}