const token1 = 'token ';
const token2 = '9e65829833acc9fa6d492e';
const token3 = '0ca6d5233bcb2f42d8';

export default {
    token: token1 + token2 + token3,
    apiReg: "^https://api.github.com/repos/[0-9a-z_!~*'().&=+$%-]+/[0-9a-z_!~*'().&=+$%-]+/contents(/[0-9a-z\u4e00-\u9fa5_!~*'().&=+$%-]+)*$",
}