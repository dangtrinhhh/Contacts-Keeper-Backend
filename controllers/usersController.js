const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// @desc(description) Register user
// @route POST /api/users/register
// @access public
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(400)
        throw new Error("All fields are mandatory !")
    }

    const userAvailable = await User.findOne({ email }); // WARNING!!! assign Object

    if (userAvailable) {
        res.status(400)
        throw new Error("User is already registered !")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        username,
        email,
        password: hashedPassword
    })

    if (user) {
        res.status(201).json({ _id: user.id, email: user.email });
    } else {
        res.status(400);
        throw new Error("User data is invalid.")
    }

    res.json({ message: "Register user." });
});

// @desc(description) Login user
// @route POST /api/users/login
// @access public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory!");
    }

    const user = await User.findOne({ email });

    // So sánh mật khẩu với mật khẩu đã được mã hóa
    if (user && (await bcrypt.compare(password, user.password))) {
        const userData = {
            username: user.username,
            email: user.email,
            id: user.id,
        };

        // Tạo Access Token (thời hạn ngắn hơn)
        const accessToken = jwt.sign(
            { user: userData },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "5m" } // Thời hạn ngắn hơn để bảo mật
        );

        // Tạo Refresh Token (thời hạn dài hơn)
        const refreshToken = jwt.sign(
            { user: userData },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "1d" } // Thời hạn dài hơn để làm mới Access Token
        );

        // Lưu Refresh Token vào DB (nếu muốn)
        user.refresh_token = refreshToken; // Giả sử bạn có trường này trong mô hình người dùng
        await user.save();

        // Gửi Access Token và Refresh Token (HTTP-only cookie) về phía client
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 5 * 60 * 1000, // 5 mins
        });
        
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Chỉ gửi cookie qua HTTPS trong môi trường production
            sameSite: 'strict', // Cookie sẽ không được gửi cùng với yêu cầu chéo trang
            // secure: false,   // Đặt thành `true` nếu bạn dùng HTTPS
            // sameSite: 'Lax',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        // Gửi phản hồi thành công với Access Token
        res.status(200).json({ accessToken, user: userData });
    } else {
        res.status(401);
        throw new Error("Email or password is invalid.");
    }
});

// const loginUser = asyncHandler(async (req, res) => {
//     const { email, password } = req.body;
//     if(!email || !password) {
//         res.status(400);
//         throw new Error("All fiels are mandatory !");
//     }
//     const user = await User.findOne({ email });

//     // Compare password with hashed password
//     if (user && (await bcrypt.compare(password, user.password))) {
//         const userData = {
//             username: user.username,
//             email: user.email,
//             id: user.id,
//         }

//         const accessToken = jwt.sign({
//             user: userData
//         }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
//         res.status(200).json({ accessToken, "user": userData });
//     } else {
//         res.status(401);
//         throw new Error("Email or password is invalid.");
//     }

//     res.json({ message: "Login user." });
// });


// @desc(description) Logout user
// @route POST /api/users/logout
// @access public
const logoutUser = asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies; // Lấy refresh token từ cookie

    if (!refreshToken) {
        return res.status(204).json({ message: "No content, already logged out." }); // Không có token trong cookie
    }

    // Tìm người dùng với refresh token tương ứng
    const user = await User.findOne({ refresh_token: refreshToken });

    if (!user) {
        // Không tìm thấy người dùng, xóa cookie và trả về
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        return res.status(204).json({ message: "User logged out successfully." }); // No content
    }

    // Xóa refresh token từ DB
    user.refresh_token = null;
    await user.save();

    // Xóa cookie chứa refresh token
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });

    res.status(200).json({ message: "User logged out successfully." });
});


// @desc(description) Get current user
// @route GET /api/users/current
// @access private
const getCurrentUser = asyncHandler(async (req, res) => {
    res.json(req.user);
});

// @desc(description) Refresh Token
// @route POST /api/users/refresh-token
// @access public
const refreshAccessToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return res.status(403).json({ message: "Refresh token not found, please log in again" });
    }

    try {
        // Verify Refresh Token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findOne({ refresh_token: refreshToken });

        if (!user || user.refresh_token !== refreshToken) {
            return res.status(403).json({ message: "Invalid refresh token, please log in again" });
        }

        // Generate a new Access Token
        const newAccessToken = jwt.sign(
            { user: { id: user._id, email: user.email, username: user.username } },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "5m" }
        );

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 5 * 60 * 1000, // 5 mins
        });

        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).json({ message: "Invalid refresh token, please log in again" });
        res.clearCookie('accessToken');
        return res.redirect('/');
    }
});

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshAccessToken
}
