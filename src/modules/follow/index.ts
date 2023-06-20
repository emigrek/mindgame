import mongoose from "mongoose";
import followSchema, { FollowDocument } from "../schemas/Follow";

const FollowModel = mongoose.model("Follow", followSchema);

const getFollow = async (sourceUserId: string, targetUserId: string): Promise<FollowDocument | null> => {
    const follow = await FollowModel.findOne({ sourceUserId, targetUserId });
    return follow;
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
    const followers = await FollowModel.find({ targetUserId: userId });
    return followers;
}

const getFollowing = async (userId: string): Promise<FollowDocument[]> => {
    const following = await FollowModel.find({ sourceUserId: userId });
    return following;
};

const getMutuals = async (userId: string): Promise<FollowDocument[]> => {
    const followers = await getFollowers(userId);
    const following = await getFollowing(userId);

    const mutuals = followers.filter(follower => following.some(following => following.targetUserId === follower.sourceUserId));
    return mutuals;
}

export { createFollow, deleteFollow, getFollowers, getFollowing, getMutuals, getFollow };