import CustomError from "../errors/index.js";

const chechPermissions = (requestUser, resourceUserId) => {
  // console.log(typeof requestUser.userId);
  // console.log(typeof resourceUserId);
  console.log(requestUser, resourceUserId);
  if (requestUser.role === "admin") return;
  if (requestUser._id === resourceUserId.toString()) return;
  throw new CustomError.UnauthorizedError(
    "Not authorized to access this route"
  );
};

export default chechPermissions;
