function generateOtp() {
  // const nums = "0123456789";
  // let digits = "";

  // for (let i = 0; i < limit; i++) {
  //   digits += nums[Math.floor(Math.random() * 10)];
  // }

  const otp = Math.floor(1000 + Math.random() * 9000);

  return otp;
}

export default generateOtp;
