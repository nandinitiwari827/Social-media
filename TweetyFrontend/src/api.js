import axios from "axios"

let API_BASE_URL = "http://localhost:1256/api/v1"

export let registerUser=async(formData)=>{
    try{
        let response=await axios.post(`${API_BASE_URL}/users/register`, formData, {
            headers: {
                "Content-type": "application/json"
            }
        })
        return response.data
    }catch(error){
        console.log("Registration error: " ,error.response?.data || error.message)
        throw error
    }
}

export let checkEmailExists = async (email) => {
  try {
    let response = await axios.post(`${API_BASE_URL}/users/check-email`,
      { email },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export let loginUser=async(loginData)=>{
    try{
        let response=await axios.post(`${API_BASE_URL}/users/login`, loginData, {
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true
        })
        console.log('Login response:', response.data);
        return response.data
    }catch(error){
       console.log('Login error (full response): ', error.response);
    console.log('Login error message: ', error.response?.data?.message || error.message);
    throw error
    }
}

export let getUserProfile=async(userId)=>{
   try{
        let response=await axios.get(`${API_BASE_URL}/users/${userId}`, {
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true
        })
        return response.data
    }catch(error){
    console.log('fetching user profile by id message: ', error.response?.data?.message || error.message);
    throw error
    }   
}

export const getCurrentUser = async () => {
  try {
    console.log("Calling getCurrentUser with URL:", `${API_BASE_URL}/users/current-user`);
    let response = await axios.get(`${API_BASE_URL}/users/current-user`, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    console.log("getCurrentUser response:", response.data);
    return response.data;
  } catch (error) {
    console.error("getCurrentUser error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    if (error.response?.data?.message === 'Token expired. Please log in again.') {
      window.location.href = '/login';
    }
    throw error;
  }
};

export let getUserPosts=async(userId)=>{
    try{
        let response=await axios.get(`${API_BASE_URL}/posts/user/${userId}` ,{
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        })
        return response.data
    }catch(error){
        console.log('Get user posts error: ', error.response?.data?.message || error.message)
        throw error
    }
}

export let addComment=async(postId, comment)=>{
    try{
        let response=await axios.post(`${API_BASE_URL}/comments/post/${postId}`, {comment},{
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        })
        return response.data
    }catch(error){
        console.log('Posting comment error: ', error.response?.data?.message || error.message)
        throw error
    }
}

export let deleteComment=async(postId, commentId)=>{
    try{
        let response=await axios.delete(`${API_BASE_URL}/comments/post/${postId}/${commentId}` ,{
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        })
        return response.data
    }catch(error){
        console.log('Deleting comment error: ', error.response?.data?.message || error.message)
        throw error
    }
}

export let getPostComments=async(postId)=>{
    try{
        let response=await axios.get(`${API_BASE_URL}/comments/post-comments/${postId}` ,{
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        })
        return response.data
    }catch(error){
        console.log('get post comment error: ', error.response?.data?.message || error.message)
        throw error
    }
}

export let getLikedComments=async(postId)=>{
    try{
        let response=await axios.get(`${API_BASE_URL}/comments/liked-comments/${postId}` ,{
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        })
        return response.data
    }catch(error){
        console.log('get liked comments error: ', error.response?.data?.message || error.message)
        throw error
    }
}

export let getPostLikes=async(postId)=>{
     try{
        let response=await axios.get(`${API_BASE_URL}/likes/post/${postId}` ,{
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        })
        return response.data
    }catch(error){
        console.log('Get post liked error: ', error.response?.data?.message || error.message)
        throw error
    }
}

export let togglePostLike=async(postId)=>{
    try{
        let response=await axios.post(`${API_BASE_URL}/likes/post/${postId}`, {}, {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        })
        return response.data
    }catch(error){
        console.error('Toggle like post error:', {
            message: error.response?.data?.message || error.message,
            status: error.response?.status,
            data: error.response?.data,
        });
        throw error
    }
}

export let toggleCommentLike=async(postId, commentId)=>{
    try{
        let response=await axios.post(`${API_BASE_URL}/likes/comment/${postId}/${commentId}`, {} ,{
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        })
        return response.data
    }catch(error){
        console.log('Toggle like comment error: ', error.response?.data?.message || error.message)
        throw error
    }
}

export let getCommentLikes=async(postId, commentId)=>{
    try{
        let response=await axios.get(`${API_BASE_URL}/likes/comment/${postId}/${commentId}` ,{
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        })
        return response.data
    }catch(error){
        console.log('get comment likes error: ', error.response?.data?.message || error.message)
        throw error
    }
}

export let getPostById=async(postId)=>{
        try{
        let response=await axios.get(`${API_BASE_URL}/posts/${postId}` ,{
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        })
        return response.data
    }catch(error){
        console.log('getting post by id error: ', error.response?.data?.message || error.message)
        throw error
    }
}

export let getLikedPosts=async()=>{
    try{
        let response=await axios.get(`${API_BASE_URL}/likes/liked-posts` ,{
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        })
        return response.data
    }catch(error){
        console.log('Toggle like comment error: ', error.response?.data?.message || error.message)
        throw error
    }
}

export let logoutUser=async()=>{
    try{
        let response=await axios.post(`${API_BASE_URL}/users/logout`, {}, {
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true
        })
     if (response.status === 200) {
            return response.data
        } else {
            throw new Error(`Logout failed with status: ${response.status}`);
        }
    }catch(error){
      console.error('Logout failed:', {
            message: error.response?.data?.message || error.message,
            status: error.response?.status,
        });
    throw error
    }
}

export let changeCurrentPassword = async (oldPassword, newPassword) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/users/change-password`, {
            oldPassword,
            newPassword,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error('API error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers,
        });
        throw new Error(error.response?.data?.message || 'Failed to change password')
    }
}

export let updateAccountDetails=async(updateData)=>{
     try {
        let response = await axios.patch(`${API_BASE_URL}/users/update-account`, updateData, {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
       console.log("Details updation error: " ,error.response?.data || error.message)
        throw error
    }
}

export let uploadAvatar=async(formaData)=>{
     try {
        let response = await axios.post(`${API_BASE_URL}/posts/upload-avatar`,formaData, {
            withCredentials: true,
        })
        return response.data
    } catch (error) {
       console.log("Upload avatar error: " ,error.response?.data || error.message)
        throw error
    }
}

export let uploadCoverImage=async(formData)=>{
     try {
        let response = await axios.post(`${API_BASE_URL}/posts/upload-coverImage`, formData, {
            withCredentials: true,
        })
        return response.data
    } catch (error) {
       console.log("Upload cover image error: " ,error.response?.data || error.message)
        throw error
    }
}

export let deleteAvatar=async()=>{
     try {
        let response = await axios.delete(`${API_BASE_URL}/posts/delete-avatar`, {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        })
        return response.data
    } catch (error) {
       console.log("Delete avatar error: " ,error.response?.data || error.message)
        throw error
    }
}

export let deleteCoverImage=async()=>{
     try {
        let response = await axios.delete(`${API_BASE_URL}/posts/delete-coverImage`, {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        })
        return response.data
    } catch (error) {
       console.log("Delete cover image error: " ,error.response?.data || error.message)
        throw error
    }
}

export let getAllPosts=async(params={})=>{
     try {
        let response = await axios.get(`${API_BASE_URL}/posts/`, {
            params,
            withCredentials: true,
        })
        return response.data
    } catch (error) {
       console.log("Getting all posts error: " ,error.response?.data || error.message)
        throw error
    }
}

export let uploadPost=async(formaData, config = {})=>{
     try {
        let response = await axios.post(`${API_BASE_URL}/posts/`, formaData, {
         withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      ...config,
    });
        return response.data
    } catch (error) {
       console.log("Upload post error: " ,error.response?.data || error.message)
        throw error
    }
}

export let editPost=async(postId, newCaption)=>{
     try {
        let response = await axios.patch(`${API_BASE_URL}/posts/${postId}`, {newCaption}, {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        })
        return response.data
    } catch (error) {
       console.log("Edit post error: " ,error.response?.data || error.message)
        throw error
    }
}

export let deletePost=async(postId)=>{
     try {
        let response = await axios.delete(`${API_BASE_URL}/posts/${postId}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        })
        return response.data
    } catch (error) {
       console.log("Delete delete post error: " ,error.response?.data || error.message)
        throw error
    }
}

export let getFollowing=async(userId)=>{
     try {
        let response = await axios.get(`${API_BASE_URL}/users/user/${userId}/following`, {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        })
        return response.data
    } catch (error) {
       console.log("Getting following list error: " ,error.response?.data || error.message)
        throw error
    }
}

export let getFollowers=async(userId)=>{
     try {
        let response = await axios.get(`${API_BASE_URL}/users/user/${userId}/followers`, {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        })
        return response.data
    } catch (error) {
       console.log("Getting followers list error: " ,error.response?.data || error.message)
        throw error
    }
}

export let toggleFollow = async (userId) => {
  try {
    let response = await axios.post(`${API_BASE_URL}/users/user/${userId}/follow`, {}, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("Toggling follow error: ", error.response?.data || error.message);
    throw error;
  }
}

export let searchUsers=async(query)=>{
 try {
    let response = await axios.get(`${API_BASE_URL}/search/`, {
      params: {query},
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    console.log("Search users error: ", error.response?.data || error.message);
    throw error
  }
}
