import mongoose from "mongoose";
import followSchema, {FollowDocument} from "@/modules/schemas/Follow";

const FollowModel = mongoose.model("Follow", followSchema);

const getFollow = async (sourceUserId: string, targetUserId: string): Promise<FollowDocument | null> => {
    return FollowModel.findOne({ sourceUserId, targetUserId });
};

const createFollow = async (sourceUserId: string, targetUserId: string): Promise<FollowDocument | null> => {
    const follow = await getFollow(sourceUserId, targetUserId);
    if(follow) return null;

    const newFollow = new FollowModel({ sourceUserId, targetUserId });
    await newFollow.save();
    return newFollow;
}

const deleteFollow = async (sourceUserId: string, targetUserId: string): Promise<boolean> => {
    await FollowModel.deleteOne({ sourceUserId, targetUserId });
    return true;
};

const getFollowers = async (userId: string): Promise<FollowDocument[]> => {
    return FollowModel.find({ targetUserId: userId });
}

const getFollowing = async (userId: string): Promise<FollowDocument[]> => {
    return FollowModel.find({ sourceUserId: userId });
};

export { createFollow, deleteFollow, getFollowers, getFollowing, getFollow };