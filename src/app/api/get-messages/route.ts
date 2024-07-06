import userModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "next-auth";
import mongoose from "mongoose";


export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);

    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json({
            succcess: false,
            message: "not authenticated"
        }, { status: 401 })
    }

    const userId = new mongoose.Types.ObjectId(user._id);

    try {
        const user = await userModel.aggregate([
            { $match: {id: userId} },
            { $unwind: '$messages' },
            { $sort: {"message.createdAt": -1} },
            { $group: { _id: '$_id', message: { $push: '$messages' } } }
        ])

        if (!user || user.length === 0) {
            return Response.json({
                succcess: false,
                message: "User not found"
            }, { status: 404 }) 
        }

        return Response.json({
            succcess: true,
            messages: user[0].message
        }, { status: 200 })

    } catch (error) {
        console.log("An unexpected error occured", error)
        return Response.json({
            succcess: false,
            message: "An unexpected error occured"
        }, { status: 500 })
    }
}