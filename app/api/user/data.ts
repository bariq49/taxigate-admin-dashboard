import avatar3 from "@/public/images/avatar/avatar-3.jpg";
export const user = [
 {
 id: 1,
 name: "taxigate",
 image: avatar3,
 password: "password",
 email: "taxigate@codeshaper.net",
 resetToken: null,
 resetTokenExpiry: null,
 profile: null,
 },
];

export type User = (typeof user)[number];
