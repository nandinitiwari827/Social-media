import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BsThreeDotsVertical } from 'react-icons/bs'
import { getCurrentUser, getUserPosts, getUserProfile, uploadAvatar, deleteAvatar, uploadCoverImage, deleteCoverImage, uploadPost, editPost, deletePost, getFollowers, getFollowing, togglePostLike, toggleCommentLike, toggleFollow, addComment, deleteComment, getPostLikes, getPostComments, getPostById, getCommentLikes} from '../api.js';

function YourProfile() {
    let navigate = useNavigate()
    let {id: userId}=useParams()
    let [coverImageClicked, setCoverImageClicked] = useState(false)
    let [avatarClicked, setAvatarClicked] = useState(false)
    let [followersClicked, setFollowersClicked] = useState(false)
    let [followers, setFollowers]=useState([])
    let [followingClicked, setFollowingClicked] = useState(false)
    let [following, setFollowing]=useState([])
    let [avatarCameraClicked, setAvatarCameraClicked] = useState(false)
    let [coverImageCameraClicked, setCoverImageCameraClicked] = useState(false)
    let [user, setUser] = useState(null)
    let [currentUser, setCurrentUser]=useState(null)
    let [posts, setPosts] = useState([])
    let [loading, setLoading] = useState(true)
    let [error, setError] = useState(null)
    let [avatarUrl, setAvatarUrl] = useState("");
    let [coverImageUrl, setCoverImageUrl] = useState("");
    let [uploadLoading, setUploadLoading] = useState(false);
    let [uploadCoverLoading, setUploadCoverLoading] = useState(false);
    let [uploadPostLoading, setUploadPostLoading] = useState(false);
    let [mediaClicked, setMediaClicked] = useState(null);
    let [mediaFile, setMediaFile] = useState(null);
    let [caption, setCaption] = useState("");
    let [postPopup, setPostPopup] = useState(null);
    let [editingPostId, setEditingPostId] = useState(null);
    let [editedCaption, setEditedCaption] = useState("");
    let [commentsClicked, setCommentsClicked]=useState(false)
    let [selectedPostId, setSelectedPostId]=useState(null)
    let [newComment, setNewComment]=useState('')
    let [comments, setComments]=useState([])
    let [likes, setLikes]=useState([])
    let [likesClicked, setLikesClicked]=useState(false)
    let [commentLikes, setCommentLikes]=useState([])
    let [commentLikesClicked, setCommentLikesClicked]=useState(false)
    let [hoveringFollow, setHoveringFollow] = useState(false)

    let handleMedia = (postId) => {
        setMediaClicked(postId)
    };

    let handleFollowingList = async() => {
        setFollowingClicked(true)
        try{
          let response=await getFollowing(user._id)
          setFollowing(response.data.following || [])
        }catch(error){
          console.log("Error in getting following list", error)
           setFollowing([])
        }  
    }

    let handleFollowersList = async() => {
        setFollowersClicked(true)
        try{
          let response=await getFollowers(user._id)
          setFollowers(response.data.followers || [])
        }catch(error){
          setFollowers([])
        }
    }

let handleToggleFollow = async (followId) => {
  try {
    let response = await toggleFollow(followId);
    let { user: updatedUser, currentUser: updatedCurrentUser } = response.data;

    setFollowers(updatedUser.followers || []);
    setFollowing(updatedUser.following || []);
    setUser(prev => ({
      ...prev,
      followers: updatedUser.followers,
      following: updatedUser.following
    }));
    setCurrentUser(updatedCurrentUser);

    if (!userId || userId === updatedCurrentUser._id) {
      setUser(updatedCurrentUser);
      setFollowers(updatedCurrentUser.followers || []);
      setFollowing(updatedCurrentUser.following || []);
    }

  } catch (error) {
    console.error("Failed to toggle follow:", error);
    alert("Failed to update follow status");
  }
}

    let handleUpdateAvatar = () => {
    setAvatarCameraClicked(true);
  };

  let handleUploadAvatar = async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    let formData = new FormData();
    formData.append('avatar', file);

    setUploadLoading(true);
    setAvatarCameraClicked(false);

    try {
      let res = await uploadAvatar(formData);
      setAvatarUrl(res.data.avatar);
      let updatedUserData = await getCurrentUser();
      setUser(updatedUserData.data);
    } catch (err) {
      alert('upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  let handleAvatarDelete = async () => {
    try {
      await deleteAvatar();
      setAvatarUrl('');
      setAvatarCameraClicked(false);
      let updatedUserData = await getCurrentUser();
      setUser(updatedUserData.data);
    } catch (err) {
      alert('Failed to delete photo!');
    }
  }

  let handleUpdateCoverImage = () => {
    setCoverImageCameraClicked(true);
  }

  let handleUploadCoverImage = async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    let formData = new FormData();
    formData.append('coverImage', file);

    setUploadCoverLoading(true);
    setCoverImageCameraClicked(false);

    try {
      let res = await uploadCoverImage(formData);
      setCoverImageUrl(res.data.coverImage);
      let updatedUserData = await getCurrentUser();
      setUser(updatedUserData.data);
    } catch (err) {
      alert('upload failed');
    } finally {
      setUploadCoverLoading(false);
    }
  }

  let handleCoverImageDelete = async () => {
    try {
      await deleteCoverImage();
      setCoverImageUrl('');
      setCoverImageCameraClicked(false);
      let updatedUserData = await getCurrentUser();
      setUser(updatedUserData.data);
    } catch (err) {
      alert('Failed to delete photo!');
    }
  }

  let handleLikesClicked=async(postId)=>{
    if(!isOwnProfile) return
    setLikesClicked(true)
    setSelectedPostId(postId)

      try{
          let response=await getPostLikes(postId)
          setLikes(response.data.likes || [])
        }catch (error) {
    console.log("Error in getting likes list", error)
    if (error.response?.status === 403) {
      setLikesClicked(false)
    }
    setLikes([])
  }
}

let handleCommentsClicked=async(postId)=>{
  setCommentsClicked(true)
  setSelectedPostId(postId)
  setComments([])
  try{
    let response=await getPostComments(postId)
    setComments(response.data.comments || [])
  }catch(error){
    console.log("Error in getting comments list", error)
    setComments([])
  }
}

let handleAddComment=async(postId)=>{
  if(!newComment.trim()){
    alert("Add a comment")
    return
  }
  try{
    await addComment(postId, newComment)
    setNewComment('')
    let response=await getPostComments(postId)
    setComments(response.data.comments || [])

    let updatedPostResponse=await getPostById(postId)
    let updatedPost=updatedPostResponse.data

    setPosts(prevPosts =>
  prevPosts
    .filter(p => p)
    .map(p =>
      p._id === postId
        ? { ...updatedPost, likes: p.likes }
        : p
    )
)
  }catch(error){
     console.log('Failed to add comment:', error.response?.data?.message || error.message);
    alert(`Failed to add comment. Error: ${error.response?.data?.message || 'Please check your network or try again later.'}`);
  }
}

let handleDeleteComment=async(postId, commentId)=>{
  try{
    await deleteComment(postId, commentId)
   setComments((prevComments) =>
      prevComments.filter((comment) => comment._id !== commentId)
    );

    let updatedPostResponse = await getPostById(postId)
    let updatedPost = updatedPostResponse.data

   setPosts(prevPosts =>
  prevPosts
    .filter(p => p)
    .map(p =>
      p._id === postId
        ? { ...updatedPost, likes: p.likes } 
        : p
    )
)
  }catch(error){
    console.log("Failed to delete comment", error)
    alert("failed to delete a comment")
  }
}

let handleCommentsLikeClicked=async(postId, commentId)=>{
   if(!isOwnProfile) return
   setCommentLikesClicked(true)

          try{
          let response=await getCommentLikes(postId, commentId)
          setCommentLikes(response.data.likes || [])
        }catch (error) {
    console.log("Error in getting comment likes list", error)
    if (error.response?.status === 403) {
      setCommentLikesClicked(false)
    }
    setCommentLikes([])
  }
}

  let modalRef = useRef(null);
  useEffect(() => {
    let handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setFollowingClicked(false);
        setFollowersClicked(false);
        setAvatarClicked(false);
        setCoverImageClicked(false);
        setAvatarCameraClicked(false);
        setCoverImageCameraClicked(false);
        setMediaClicked(false);
        setPostPopup(false);
        setLikesClicked(false)
        setCommentsClicked(false)
        setCommentLikesClicked(false)
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [
    followingClicked,
    followersClicked,
    avatarCameraClicked,
    coverImageCameraClicked,
    avatarClicked,
    coverImageClicked,
    mediaClicked,
    postPopup,
    likesClicked,
    commentsClicked,
    commentLikesClicked
  ])

useEffect(() => {
  let fetchProfileAndPosts = async () => {
    try {
      setLoading(true);

      let currentUserData = await getCurrentUser();
      setCurrentUser(currentUserData.data);

      let userData = userId ? await getUserProfile(userId) : currentUserData;
      setUser(userData.data);

      setFollowers(userData.data.followers || []);
      setFollowing(userData.data.following || []);

      setAvatarUrl(userData.data.avatar || '');
      setCoverImageUrl(userData.data.coverImage || '');

      let postsData = await getUserPosts(userData.data._id);
      let postsWithLikes = postsData.data.posts.map(post => ({
        ...post,
        likes: post.likes || []
      }));

      setPosts(postsWithLikes);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  fetchProfileAndPosts();
}, [userId]);

  let handleUploadPost = (e) => {
    setMediaFile(e.target.files[0]);
  };

  let handleUpload = async () => {
    if (!mediaFile) {
      alert('Please select a video or image file.');
      return;
    }

    if (!mediaFile.type.startsWith('image/') && !mediaFile.type.startsWith('video/')) {
    alert('Unsupported file type. Please upload an image or video.');
    return;
  }

   let formData = new FormData();
    formData.append('mediaFile', mediaFile)
    formData.append('caption', caption)

    try {
      setUploadPostLoading(true)
      await uploadPost(formData)
    
     let updatedPostsResponse = await getUserPosts(user._id);
let updatedPosts = updatedPostsResponse.data.posts.map(post => ({
  ...post,
  likes: post.likes || []
}));
setPosts(updatedPosts);

setUser(prevUser => ({
  ...prevUser,
  numberOfPosts: updatedPostsResponse.data.numberOfPosts
}));

      setMediaFile(null);
      setCaption('');
      alert('Post uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload post.');
    } finally {
      setUploadPostLoading(false);
    }
  };

  let handleEditPost = (postId, currentCaption) => {
    setEditingPostId(postId);
    setEditedCaption(currentCaption);
    setPostPopup(null);
  };

  let handleSaveEdit = async (postId) => {
    try {
      let response = await editPost(postId, editedCaption);
      let updatedPosts = posts.map((post) =>
        post._id === postId ? { ...post, caption: response.data.caption } : post
      );
      setPosts(updatedPosts);
      setEditingPostId(null);
    } catch (error) {
      alert('Failed to update post');
    }
  };

  let handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
     let updatedPosts = posts.filter((post) => post._id !== postId);
    setPosts(updatedPosts);

    let updatedPostsResponse = await getUserPosts(user._id);

    setUser((prevUser) => ({
      ...prevUser,
      numberOfPosts: updatedPostsResponse.data.numberOfPosts,
    }));
    } catch (error) {
      alert('Failed to delete post');
    }
  };

  let handleTogglePostLike = async (postId) => {
    try {
        let response = await togglePostLike(postId)
        let updatedPosts = posts.map((post) =>
            post._id === postId ? { ...post, likes: response.data.likes || [] } : post
        );
        setPosts(updatedPosts);
    } catch (error) {
        console.log("Failed to toggle like: ", error);
        alert("Failed to toggle like");
    }
}

  let handleToggleCommentLike = async (postId, commentId) => {
    try {
        let response = await toggleCommentLike(postId, commentId)
        let updatedPosts = posts.map((post) =>{
      if (post._id === postId) {
       
        let updatedComments = post.comments.map((comment) =>
          comment._id === commentId
            ? { ...comment, likes: response.data.likes || [] }
            : comment
        );
        return { ...post, comments: updatedComments };
      }
          return post
        });
        setPosts(updatedPosts);

        let updatedModalComments = comments.map((comment) =>
      comment._id === commentId
        ? { ...comment, likes: response.data.likes || [] }
        : comment
    );
    setComments(updatedModalComments);
    } catch (error) {
        console.log("Failed to toggle comment like: ", error);
        alert("Failed to toggle comment like")
    }
}

let isOwnProfile=currentUser?._id===user?._id

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        No user data available.
      </div>
    );
  }

    return (
 <div className="flex flex-col justify-center items-center gap-y-2 sm:gap-y-3 md:gap-y-4 px-2 sm:px-3 md:px-4 lg:px-8 min-h-screen">
  <div className="border border-gray-500 absolute top-[112px] sm:top-[56px] md:top-[64px] lg:top-[64px] w-full max-w-[90vw] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] pt-1">
    {/* Header Section */}
    <div ref={modalRef} className="flex items-center gap-x-2 sm:gap-x-3 md:gap-x-4 lg:gap-x-5 px-2 sm:px-3 md:px-4 lg:px-4">
      <button
        onClick={() => navigate("/")}
        className="flex items-center cursor-pointer rounded-full p-1 sm:p-2 h-8 sm:h-9 md:h-10 lg:h-11 hover:bg-gray-100 duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"
          viewBox="0 0 24 24"
        >
          <g fill="none">
            <path d="M24 0v24H0V0z" />
            <path
              fill="black"
              d="M3.636 11.293a1 1 0 0 0 0 1.414l5.657 5.657a1 1 0 0 0 1.414-1.414L6.757 13H20a1 1 0 1 0 0-2H6.757l3.95-3.95a1 1 0 0 0-1.414-1.414z"
            />
          </g>
        </svg>
      </button>
      <div className="flex flex-col text-left ml-2 sm:ml-3">
        <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold">
          {user?.firstName} {user?.lastName || ""}
        </p>
        <p className="text-xs sm:text-sm md:text-sm lg:text-base text-gray-500">
          {user?.numberOfPosts || 0} posts
        </p>
      </div>
    </div>

    {/* Cover Image Section */}
    <div
      onClick={() => {
        if (isOwnProfile) {
          handleUpdateCoverImage();
        } else if (coverImageUrl) {
          setCoverImageClicked(true);
        }
      }}
    >
     <div className="bg-gray-300 h-[150px] sm:h-[180px] md:h-[200px] lg:h-[230px] w-full overflow-hidden relative">
  {coverImageUrl ? (
    <img
      className="cursor-pointer object-cover w-full h-full"
      src={coverImageUrl}
      alt="cover"
    />
  ) : (
    <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
  )}

  {isOwnProfile && uploadCoverLoading && (
    <div className="flex w-full h-full items-center justify-center z-50 absolute top-0 left-0">
      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 border-4 border-dotted border-white rounded-full animate-spin"></div>
    </div>
  )}

  {isOwnProfile && !coverImageUrl && !uploadCoverLoading && (
    <div className="absolute inset-0 flex items-center justify-center">
      <button
        onClick={handleUpdateCoverImage}
        className="text-gray-600 cursor-pointer bg-[#7e8ce0] w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9" viewBox="0 0 512 512">
          <path fill="white" fillRule="evenodd" d="M426.667 320v64h64v42.667h-64v64H384v-64h-64V384h64v-64zm-128-245.333l38.394 53.324l89.606.01v170.666H384V170.646l-71.097.01l-38.407-53.322h-79.701l-38.37 53.333H85.333V384h213.333v42.667h-256V128h89.6l38.4-53.333zm-64 117.333C281.795 192 320 230.205 320 277.334c0 47.128-38.205 85.333-85.333 85.333s-85.333-38.205-85.333-85.333S187.539 192 234.667 192m0 42.667c-23.564 0-42.667 19.103-42.667 42.667S211.103 320 234.667 320s42.667-19.102 42.667-42.666s-19.103-42.667-42.667-42.667M341.334 192c11.782 0 21.333 9.552 21.333 21.334s-9.551 21.333-21.333 21.333S320 225.116 320 213.334S329.552 192 341.334 192"/>
        </svg>
      </button>
    </div>
  )}
</div>
    </div>

    {/* Cover Image Popup */}
    {isOwnProfile && coverImageCameraClicked && (
      <div className="z-50 h-full w-full bg-black/70 flex justify-center items-center fixed left-0 top-0 cursor-auto">
        <div
          ref={modalRef}
          className="w-[80vw] max-w-[300px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[450px] py-2 pl-3 rounded-lg bg-white"
        >
          <div className="flex gap-x-3 py-2">
            <button onClick={() => document.getElementById("coverImageInput").click()}>
              <svg className="cursor-pointer w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path fill="gray" d="M8.75 12.75a3.25 3.25 0 1 1 6.5 0a3.25 3.25 0 0 1-6.5 0M7.882 2h8.236l1.5 3H23v16H1V5h5.382zM6.75 12.75a5.25 5.25 0 1 0 10.5 0a5.25 5.25 0 0 0-10.5 0"/>
              </svg>
            </button>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg">Upload new cover photo</p>
          </div>

          {coverImageUrl?.trim() !== "" && (
            <div>
              <div className="flex gap-x-3 py-2 border-t border-gray-300">
                <button
                  onClick={() => {
                    setCoverImageCameraClicked(false);
                    setCoverImageClicked(true);
                  }}
                >
                  <svg className="cursor-pointer w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      fill="gray"
                      fillRule="evenodd"
                      d="M8 7a4 4 0 1 1 8 0a4 4 0 0 1-8 0m0 6a5 5 0 0 0-5 5a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3a5 5 0 0 0-5-5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <p className="text-gray-400 text-sm sm:text-base md:text-lg">View cover photo</p>
              </div>

              <div className="flex gap-x-3 py-2 border-t border-gray-300">
                <button onClick={handleCoverImageDelete}>
                  <svg className="cursor-pointer w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="gray" d="M20 5a1 1 0 1 1 0 2h-1l-.933 13.07A2 2 0 0 1 16.07 22H7.93a2 2 0 0 1-1.995-1.858L5 7H4a1 1 0 0 1 0-2zm-6-3a1 1 0 1 1 0 2h-4a1 1 0 0 1 0-2z"/>
                  </svg>
                </button>
                <p className="text-gray-400 text-sm sm:text-base md:text-lg">Delete cover photo</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    {isOwnProfile && (
      <input
        type="file"
        id="coverImageInput"
        accept="image/*"
        className="hidden"
        onChange={handleUploadCoverImage}
      />
    )}

    {coverImageClicked && coverImageUrl?.trim() !== "" && (
      <div className="w-full h-full p-4 sm:p-6 md:p-8 lg:p-10 bg-black/60 z-50 backdrop-blur-sm flex justify-center items-center fixed left-0 top-0">
        <button
          onClick={() => setCoverImageClicked(false)}
          className="absolute top-2 sm:top-3 md:top-4 lg:top-5 left-2 sm:left-3 md:left-4 lg:left-5 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 stroke-black hover:stroke-gray-600 duration-200"
            viewBox="0 0 16 16"
          >
            <path fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m11.25 4.75l-6.5 6.5m0-6.5l6.5 6.5" />
          </svg>
        </button>
        <div ref={modalRef}>
          <img className="max-h-[80vh] w-full object-contain" src={coverImageUrl} alt="cover" />
        </div>
      </div>
    )}

    {/* Avatar Section */}
    <div
      onClick={() => {
        if (isOwnProfile) {
          handleUpdateAvatar();
        } else if (avatarUrl) {
          setAvatarClicked(true);
        }
      }}
    >
      <div className="overflow-hidden rounded-full h-[100px] sm:h-[110px] md:h-[120px] lg:h-[130px] w-[100px] sm:w-[110px] md:w-[120px] lg:w-[130px] relative -mt-[60px] sm:-mt-[65px] md:-mt-[70px] lg:-mt-[75px] ml-4 sm:ml-5 md:ml-6 lg:ml-8 bg-gray-200 border-4 border-white">
        <div className="flex flex-col items-center justify-center h-full">
          {avatarUrl && (
            <img
              className="cursor-pointer w-full h-full object-cover"
              src={avatarUrl}
              alt="avatar"
            />
          )}

          {!isOwnProfile && !avatarUrl && (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20" viewBox="0 0 24 24">
              <path fill="gray" d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2S7.5 4.019 7.5 6.5M20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1z"/>
            </svg>
          )}

          {isOwnProfile && uploadLoading && (
            <div className="flex w-full h-full items-center justify-center z-50 absolute top-0 left-0">
              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 border-4 border-dotted border-white rounded-full animate-spin"></div>
            </div>
          )}

          {isOwnProfile && !avatarUrl && !uploadLoading && (
            <button
              onClick={handleUpdateAvatar}
              className="text-gray-600 cursor-pointer bg-[#7e8ce0] w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9" viewBox="0 0 512 512">
                <path fill="white" fillRule="evenodd" d="M426.667 320v64h64v42.667h-64v64H384v-64h-64V384h64v-64zm-128-245.333l38.394 53.324l89.606.01v170.666H384V170.646l-71.097.01l-38.407-53.322h-79.701l-38.37 53.333H85.333V384h213.333v42.667h-256V128h89.6l38.4-53.333zm-64 117.333C281.795 192 320 230.205 320 277.334c0 47.128-38.205 85.333-85.333 85.333s-85.333-38.205-85.333-85.333S187.539 192 234.667 192m0 42.667c-23.564 0-42.667 19.103-42.667 42.667S211.103 320 234.667 320s42.667-19.102 42.667-42.666s-19.103-42.667-42.667-42.667M341.334 192c11.782 0 21.333 9.552 21.333 21.334s-9.551 21.333-21.333 21.333S320 225.116 320 213.334S329.552 192 341.334 192"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>

    {/* Avatar Popup */}
    {isOwnProfile && avatarCameraClicked && (
      <div className="z-50 h-full w-full bg-black/70 flex justify-center items-center fixed left-0 top-0 cursor-auto">
        <div
          ref={modalRef}
          className="w-[80vw] max-w-[300px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[450px] py-2 pl-3 rounded-lg bg-white"
        >
          <div className="flex gap-x-3 py-2">
            <button onClick={() => document.getElementById("avatarInput").click()}>
              <svg className="cursor-pointer w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path fill="gray" d="M8.75 12.75a3.25 3.25 0 1 1 6.5 0a3.25 3.25 0 0 1-6.5 0"/>
                <path fill="gray" d="M7.882 2h8.236l1.5 3H23v16H1V5h5.382zM6.75 12.75a5.25 5.25 0 1 0 10.5 0a5.25 5.25 0 0 0-10.5 0"/>
              </svg>
            </button>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg">Upload new profile photo</p>
          </div>

          {avatarUrl?.trim() !== "" && (
            <div>
              <div className="flex gap-x-3 py-2 border-t border-gray-300">
                <button
                  onClick={() => {
                    setAvatarCameraClicked(false);
                    setAvatarClicked(true);
                  }}
                >
                  <svg className="cursor-pointer w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      fill="gray"
                      fillRule="evenodd"
                      d="M8 7a4 4 0 1 1 8 0a4 4 0 0 1-8 0m0 6a5 5 0 0 0-5 5a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3a5 5 0 0 0-5-5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <p className="text-gray-400 text-sm sm:text-base md:text-lg">View profile photo</p>
              </div>

            <div className="flex gap-x-3 py-2 border-t border-gray-300">
              <button onClick={handleAvatarDelete}>
                <svg className="cursor-pointer w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path fill="gray" d="M20 5a1 1 0 1 1 0 2h-1l-.933 13.07A2 2 0 0 1 16.07 22H7.93a2 2 0 0 1-1.995-1.858L5 7H4a1 1 0 0 1 0-2zm-6-3a1 1 0 1 1 0 2h-4a1 1 0 0 1 0-2z"/>
                </svg>
              </button>
              <p className="text-gray-400 text-sm sm:text-base md:text-lg">Delete profile photo</p>
            </div>
            </div>
          )}
        </div>
      </div>
    )}

    {isOwnProfile && (
      <input
        type="file"
        id="avatarInput"
        accept="image/*"
        className="hidden"
        onChange={handleUploadAvatar}
      />
    )}

    {!isOwnProfile && avatarClicked && avatarUrl && (
      <div className="w-full h-full p-4 sm:p-6 md:p-8 lg:p-10 bg-black/60 z-50 backdrop-blur-sm flex justify-center items-center fixed left-0 top-0">
        <button
          onClick={() => setAvatarClicked(false)}
          className="absolute top-2 sm:top-3 md:top-4 lg:top-5 left-2 sm:left-3 md:left-4 lg:left-5 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 stroke-black hover:stroke-gray-600 duration-200"
            viewBox="0 0 16 16"
          >
            <path fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m11.25 4.75l-6.5 6.5m0-6.5l6.5 6.5" />
          </svg>
        </button>
        <div ref={modalRef}>
          <img className="max-h-[80vh] w-full object-contain rounded-xl" src={avatarUrl} alt="avatar" />
        </div>
      </div>
    )}

      {avatarClicked && avatarUrl?.trim() !== "" && (
      <div className="w-full h-full p-4 sm:p-6 md:p-8 lg:p-10 bg-black/60 z-50 backdrop-blur-sm flex justify-center items-center fixed left-0 top-0">
        <button
          onClick={() => setAvatarClicked(false)}
          className="absolute top-2 sm:top-3 md:top-4 lg:top-5 left-2 sm:left-3 md:left-4 lg:left-5 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 stroke-black hover:stroke-gray-600 duration-200"
            viewBox="0 0 16 16"
          >
            <path fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m11.25 4.75l-6.5 6.5m0-6.5l6.5 6.5" />
          </svg>
        </button>
        <div ref={modalRef}>
          <img className="max-h-[80vh] w-full object-contain" src={avatarUrl} alt="avatar" />
        </div>
      </div>
    )}

    {/* User Info Section */}
    <div className="flex flex-col text-left ml-5 my-4 lg:my-8 md:my-6 sm-5 md:ml-6 lg:ml-8">
      <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
        {user?.firstName} {user?.lastName || ""}
      </p>
      <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-500">@{user?.username}</p>
      <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-500 pt-1 sm:pt-2">
        Joined{" "}
        {user?.createdAt &&
          new Date(user.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
      </p>
      <div className="flex gap-x-4 sm:gap-x-5 md:gap-x-6 lg:gap-x-7 pt-1 sm:pt-2">
        <button
          onClick={handleFollowingList}
          className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-500 flex gap-x-1 cursor-pointer"
        >
          <p className="text-black">
            {isOwnProfile
              ? Array.isArray(currentUser?.following)
                ? currentUser.following.length
                : 0
              : Array.isArray(user?.following)
              ? user.following.length
              : 0}
          </p>{" "}
          Following
        </button>
        <button
          onClick={handleFollowersList}
          className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-500 flex gap-x-1 cursor-pointer"
        >
          <p className="text-black">
            {isOwnProfile
              ? Array.isArray(currentUser?.followers)
                ? currentUser.followers.length
                : 0
              : Array.isArray(user?.followers)
              ? user.followers.length
              : 0}
          </p>{" "}
          Followers
        </button>
      </div>
    </div>

    {/* Follow Button */}
   {!isOwnProfile && (
  <div className="absolute top-[210px] right-[25px] sm:top-[250px] md:top-[270px] lg:top-[320px] sm:right-[24px] md:right-[20px] lg:right-[40px] ">
    <button
      onMouseEnter={() => setHoveringFollow(true)}
      onMouseLeave={() => setHoveringFollow(false)}
      onClick={() => handleToggleFollow(user?._id)}
      className="px-2 sm:px-3 md:px-4 lg:px-5 xl:px-6 py-1 sm:py-1.5 md:py-2 lg:py-2.5 xl:py-3 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl cursor-pointer rounded-full font-semibold bg-blue-500 text-white hover:bg-blue-600 transition duration-200"
    >
      {currentUser?.following?.some((f) => f._id === user?._id)
        ? hoveringFollow
          ? "Unfollow"
          : "Following"
        : "Follow"}
    </button>
  </div>
)}

    {/* Posts Section */}
    <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-left px-2 sm:px-3 md:px-4 lg:px-6 py-2 w-full">
      Posts
    </p>

    {isOwnProfile && (
      <input
        type="file"
        id="postInput"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleUploadPost}
      />
    )}

    <div className="border-y border-gray-400 py-2 sm:py-3 md:py-4">
      {isOwnProfile && (
        <button
          onClick={() => document.getElementById("postInput").click()}
          className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-purple-500 hover:to-blue-400 transition duration-200 cursor-pointer text-white text-sm sm:text-base md:text-lg lg:text-xl py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 md:px-5 lg:px-6 my-2 sm:my-3 rounded-lg font-semibold"
        >
          Upload a post
        </button>
      )}
    </div>

    {mediaFile && (
      <div className="p-2 sm:p-3 md:p-4">
        <input
          type="text"
          placeholder="Add a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="py-2 px-2 sm:px-3 w-full focus:outline-none outline-none text-xs sm:text-sm md:text-base lg:text-lg"
        />
        {mediaFile.type.startsWith("image/") ? (
          <img
            src={URL.createObjectURL(mediaFile)}
            className="rounded w-full max-w-[200px] sm:max-w-[280px] md:max-w-[340px] lg:max-w-[460px] object-cover mt-2 sm:mt-3"
          />
        ) : (
          <video
            controls
            className="rounded w-full max-w-[200px] sm:max-w-[280px] md:max-w-[340px] lg:max-w-[460px] object-cover mt-2 sm:mt-3"
          >
            <source src={URL.createObjectURL(mediaFile)} type={mediaFile.type} />
            Your browser does not support the video tag.
          </video>
        )}
        <div className="flex w-full justify-center mt-2 sm:mt-3 md:mt-4">
          <button
            onClick={handleUpload}
            disabled={uploadPostLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-1.5 sm:py-2 px-4 sm:px-5 my-2 sm:my-3 md:my-4 cursor-pointer rounded-xl hover:from-blue-600 hover:to-purple-700 transition flex items-center justify-center text-xs sm:text-sm md:text-base lg:text-lg"
          >
            {uploadPostLoading ? (
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Post"
            )}
          </button>
        </div>
      </div>
    )}

    <div className="flex flex-col gap-y-2 sm:gap-y-3 md:gap-y-4">
      {user?.numberOfPosts === 0 && posts.length === 0 ? (
        <p className="text-center text-gray-500 mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base lg:text-lg">
          No posts yet.
        </p>
      ) : (
        posts.map((post) => (
          <div
            ref={modalRef}
            key={post._id}
            className="p-2 sm:p-3 md:p-4 lg:p-5 border border-gray-500 w-full max-w-[90vw] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] flex justify-between"
          >
            <Link
              to={`/profile/${user?._id}`}
              className="h-6 sm:h-7 md:h-8 lg:h-10 w-6 sm:w-7 md:w-8 lg:w-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0 mr-2 sm:mr-3 md:mr-4 lg:mr-5"
            >
              {avatarUrl ? (
                <img
                  className="w-full h-full object-cover rounded-full"
                  src={avatarUrl}
                  alt="avatar"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="m-auto w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10"
                >
                  <path
                    fill="gray"
                    d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2S7.5 4.019 7.5 6.5M20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1z"
                  />
                </svg>
              )}
            </Link>

            <div className="flex-1">
              <div className="flex gap-x-1 sm:gap-x-2 md:gap-x-2 lg:gap-x-4 flex-wrap">
                <Link
                  to={`/profile/${user?._id}`}
                  className="font-semibold hover:underline text-xs sm:text-sm md:text-base lg:text-lg"
                >
                  {user?.firstName} {user?.lastName || ""}
                </Link>
                <Link
                  to={`/profile/${user?._id}`}
                  className="text-gray-500 text-xs sm:text-sm md:text-base"
                >
                  @{user?.username}
                </Link>
                <p className="text-gray-500 text-xs sm:text-sm md:text-base">
                  {(() => {
                    const now = new Date();
                    const postDate = new Date(post.createdAt);
                    const diffInSeconds = Math.floor((now - postDate) / 1000);
                    if (diffInSeconds < 60) return `${diffInSeconds}s`;
                    if (diffInSeconds < 3600)
                      return `${Math.floor(diffInSeconds / 60)}m`;
                    if (diffInSeconds < 86400)
                      return `${Math.floor(diffInSeconds / 3600)}h`;
                    return postDate.toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                  })()}
                </p>
              </div>

              {editingPostId === post._id ? (
                <div className="flex space-x-1 sm:space-x-1.5 md:space-x-2 mt-1 sm:mt-1.5 md:mt-2">
                  <input
                    type="text"
                    value={editedCaption}
                    onChange={(e) => setEditedCaption(e.target.value)}
                    className="border px-1 sm:px-1.5 md:px-2 py-1 w-full focus:outline-none outline-none text-xs sm:text-sm md:text-base lg:text-lg"
                  />
                  <button
                    onClick={() => handleSaveEdit(post._id)}
                    className="px-1 sm:px-1.5 md:px-2 lg:px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs sm:text-sm md:text-base"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="text-left text-xs sm:text-sm md:text-base lg:text-lg break-words w-[180px] sm:w-[200px] md:w-[300px] lg:w-[450px]">
                  {post.caption}
                </div>
              )}

              {post.mediaFile && (
                <Link onClick={() => handleMedia(post._id)}>
                  {!post.caption ? (
                    <div className="rounded-xl sm:rounded-2xl mt-2 sm:mt-3 md:mt-4 lg:mt-5 overflow-hidden">
                      <div className="w-[180px] sm:w-[280px] md:w-[340px] lg:w-[460px]">
                        {post.mediaFile.endsWith(".mp4") ||
                        post.mediaFile.endsWith(".webm") ||
                        post.mediaFile.endsWith(".ogg") ? (
                          <video
                            controls
                            className="w-full h-auto rounded-xl sm:rounded-2xl object-cover"
                          >
                            <source src={post.mediaFile} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <img
                            className="w-full h-auto rounded-xl sm:rounded-2xl object-cover"
                            src={post.mediaFile}
                            alt="post media"
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl sm:rounded-2xl mt-1 sm:mt-2 md:mt-3 lg:mt-4 overflow-hidden">
                      <div className="w-[180px] sm:w-[280px] md:w-[340px] lg:w-[460px]">
                        {post.mediaFile.endsWith(".mp4") ||
                        post.mediaFile.endsWith(".webm") ||
                        post.mediaFile.endsWith(".ogg") ? (
                          <video
                            controls
                            className="w-full h-auto rounded-xl sm:rounded-2xl object-cover"
                          >
                            <source src={post.mediaFile} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <img
                            className="w-full h-auto rounded-xl sm:rounded-2xl object-cover"
                            src={post.mediaFile}
                            alt="post media"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </Link>
              )}

              <div className="flex gap-x-4 sm:gap-x-6 md:gap-x-8 lg:gap-x-14 mt-1 sm:mt-1.5 md:mt-2 lg:mt-3">
                <div className="flex gap-x-0.5 sm:gap-x-1 md:gap-x-1.5 lg:gap-x-2 group">
                  <button
                    onClick={() => handleTogglePostLike(post._id)}
                    className="cursor-pointer"
                  >
                    <svg
                      className={`${post.likes.includes(user._id) ? 'fill-pink-500 stroke-pink-500' : 'fill-none stroke-gray-400 group-hover:stroke-pink-500'} duration-200 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path
                        className={`${post.likes.includes(user._id) ? 'fill-pink-500' : 'fill-none'} group-hover:stroke-pink-500`}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m12 21l-8.3-8.3A5.6 5.6 0 1 1 12 6a5.6 5.6 0 1 1 8.6 6.6z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => isOwnProfile && handleLikesClicked(post._id)}
                    className={`group-hover:text-pink-500 duration-200 cursor-pointer text-xs sm:text-sm md:text-base lg:text-lg ${post.likes?.includes(user?._id) ? "text-pink-500" : "text-gray-600"}`}
                  >
                    {post.likes.length}
                  </button>
                </div>

                <button
                  onClick={() => handleCommentsClicked(post._id)}
                  className="flex gap-x-0.5 sm:gap-x-1 md:gap-x-1.5 lg:gap-x-2 cursor-pointer group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="none"
                      className="stroke-gray-400 group-hover:stroke-blue-500 duration-200"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 21a9 9 0 1 0-9-9c0 1.488 .36 2.891 1 4.127L3 21l4.873-1c1.236.64 2.64 1 4.127 1z"
                    />
                  </svg>
                  <p className="group-hover:text-blue-500 duration-200 text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg">
                    {post.comments.length}
                  </p>
                </button>
              </div>

              {mediaClicked === post._id && post.mediaFile?.trim() && (
                <div className="w-full h-full py-2 sm:py-4 md:py-6 lg:py-8 bg-black/60 backdrop-blur-sm fixed left-0 top-0 flex justify-center items-center z-50">
                  <button
                    onClick={() => setMediaClicked(null)}
                    className="absolute top-2 sm:top-3 md:top-4 lg:top-5 left-2 sm:left-3 md:left-4 lg:left-5 cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 stroke-black hover:stroke-gray-600 duration-200"
                      viewBox="0 0 16 16"
                    >
                      <path fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m11.25 4.75l-6.5 6.5m0-6.5l6.5 6.5" />
                    </svg>
                  </button>
                  <div
                    ref={modalRef}
                    className="max-w-[270px]"
                  >
                    {post.mediaFile.endsWith(".mp4") ||
                    post.mediaFile.endsWith(".webm") ||
                    post.mediaFile.endsWith(".ogg") ? (
                      <video
                        controls
                        className="w-full h-full object-contain"
                      >
                        <source src={post.mediaFile} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img
                        className="w-full h-full object-contain"
                        src={post.mediaFile}
                        alt="post media"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Comments Modal */}
              {commentsClicked && selectedPostId === post._id && (
                <div className="z-50 h-full w-full bg-black/60 backdrop-blur-sm fixed left-0 top-0 flex justify-center items-center cursor-auto">
                  <div
                    ref={modalRef}
                    className="h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] w-[90vw] max-w-[400px] sm:max-w-[500px] md:max-w-[550px] lg:max-w-[650px] rounded-xl sm:rounded-2xl md:rounded-3xl bg-white px-2 sm:px-3 md:px-4 lg:px-7 overflow-y-auto"
                  >
                    <p className="w-full border-b font-semibold py-2 sm:py-2.5 md:py-3 lg:py-4 border-gray-300 mb-2 sm:mb-2.5 md:mb-3 lg:mb-4 sticky top-0 z-10 bg-white text-xs sm:text-sm md:text-base lg:text-lg">
                      Comments
                    </p>
                    <button
                      onClick={(e) => {
                        setCommentsClicked(false);
                        setSelectedPostId(null);
                        e.stopPropagation();
                      }}
                      className="absolute top-2 sm:top-3 md:top-4 lg:top-5 right-2 sm:right-3 md:right-4 lg:right-5 cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 stroke-black hover:stroke-gray-600 duration-200"
                        viewBox="0 0 16 16"
                      >
                        <path fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m11.25 4.75l-6.5 6.5m0-6.5l6.5 6.5" />
                      </svg>
                    </button>
                    <div className="flex flex-col gap-y-3 sm:gap-y-4 md:gap-y-5 lg:gap-y-6 mb-8 sm:mb-10 md:mb-12">
                      {comments.length === 0 ? (
                        <p className="text-gray-500 text-center mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base">
                          No comments
                        </p>
                      ) : (
                        comments.map((aComment) => (
                          <div
                            key={aComment._id}
                            className="text-left flex gap-x-1 sm:gap-x-1.5 md:gap-x-2 lg:gap-x-3 cursor-pointer"
                          >
                            {aComment.commentedBy ? (
                              <Link
                                to={`/profile/${aComment.commentedBy?._id}`}
                                onClick={() => setCommentsClicked(false)}
                              >
                                <div className="overflow-hidden rounded-full h-6 sm:h-7 md:h-8 lg:h-10 w-6 sm:w-7 md:w-8 lg:w-10 bg-gray-200 flex justify-center items-center">
                                  {aComment.commentedBy.avatar ? (
                                    <img
                                      src={aComment.commentedBy.avatar}
                                      className="w-full h-full object-cover rounded-full"
                                      alt="commenter avatar"
                                    />
                                  ) : (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="m-auto w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        fill="gray"
                                        d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2S7.5 4.019 7.5 6.5M20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1z"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </Link>
                            ) : (
                              <div className="overflow-hidden rounded-full h-6 sm:h-7 md:h-8 lg:h-10 w-6 sm:w-7 md:w-8 lg:w-10 bg-gray-200 flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="m-auto w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    fill="gray"
                                    d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2S7.5 4.019 7.5 6.5M20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1z"
                                  />
                                </svg>
                              </div>
                            )}
                            <div className="flex flex-col w-full">
                              <div className="flex flex-col text-left bg-gray-100 rounded-xl sm:rounded-2xl px-1 sm:px-1.5 md:px-2 lg:px-3 py-1 sm:py-1.5">
                                <Link
                                  to={`/profile/${aComment.commentedBy?._id}`}
                                  onClick={() => setCommentsClicked(false)}
                                  className="text-xs sm:text-sm md:text-base font-semibold"
                                >
                                  {aComment.commentedBy?.username || "Unknown User"}
                                </Link>
                                <p className="text-xs sm:text-sm md:text-base">{aComment.comment}</p>
                              </div>
                              <div className="flex gap-x-1 sm:gap-x-1.5 md:gap-x-2 lg:gap-x-3">
                                <button
                                  onClick={() =>
                                    isOwnProfile &&
                                    handleCommentsLikeClicked(post._id, aComment._id)
                                  }
                                  className="flex gap-x-0 sm:gap-x-1 md:gap-x-1.5 lg:gap-x-2 cursor-pointer text-xs sm:text-sm md:text-base text-gray-500 ml-0.5 sm:ml-1 md:ml-1.5 lg:ml-2 mt-0.5 sm:mt-1 hover:text-blue-500"
                                >
                                  <p>{aComment.likes?.length || 0}</p>
                                  <p>Likes</p>
                                </button>
                                <button
                                  onClick={() => handleToggleCommentLike(post._id, aComment._id)}
                                  className="cursor-pointer relative top-0 sm:top-0.5 md:top-1"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-5 lg:h-5"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      className={
                                        aComment.likes?.includes(currentUser?._id)
                                          ? "fill-red-600 stroke-red-600"
                                          : "fill-none stroke-gray-400"
                                      }
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M7 3C4.239 3 2 5.216 2 7.95c0 2.207.875 7.445 9.488 12.74a.99.99 0 0 0 1.024 0C21.126 15.395 22 10.157 22 7.95C22 5.216 19.761 3 17 3s-5 3-5 3s-2.239-3-5-3z"
                                    />
                                  </svg>
                                </button>
                                {(aComment.commentedBy?._id === currentUser?._id || isOwnProfile) && (
                                  <button
                                    onClick={() => handleDeleteComment(post._id, aComment._id)}
                                    className="group cursor-pointer pt-0 sm:pt-1 md:pt-1.5 lg:pt-2"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-5 lg:h-5"
                                      viewBox="0 0 24 24"
                                    >
                                      <g fill="none">
                                        <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.11.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                                        <path
                                          className="fill-gray-500 group-hover:fill-red-500 duration-200"
                                          d="M20 5a1 1 0 1 1 0 2h-1l-.003.071l-.933 13.071A2 2 0 0 1 16.069 22H7.93a2 2 0 0 1-1.995-1.858l-.933-13.07L5 7H4a1 1 0 0 1 0-2zm-6-3a1 1 0 1 1 0 2h-4a1 1 0 0 1 0-2z"
                                        />
                                      </g>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}

                      <div className="flex items-center gap-x-2 sm:gap-x-3 px-2 sm:px-3 md:px-4 lg:px-5 py-2 border-t bg-white w-full sticky bottom-0">
                        <Link to={`/profile/${isOwnProfile?._id}`} onClick={() => setCommentsClicked(false)}>
                          <div className="overflow-hidden rounded-full h-6 sm:h-7 md:h-8 lg:h-10 w-6 sm:w-7 md:w-8 lg:w-10 bg-gray-200 flex items-center justify-center">
                            {isOwnProfile?.avatar ? (
                              <img
                                className="w-full h-full object-cover rounded-full"
                                src={isOwnProfile.avatar}
                                alt="user avatar"
                              />
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="m-auto w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  fill="gray"
                                  d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2S7.5 4.019 7.5 6.5M20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1z"
                                />
                              </svg>
                            )}
                          </div>
                        </Link>
                        <textarea
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="rounded-xl sm:rounded-2xl pl-1 sm:pl-1.5 md:pl-2 lg:pl-3 w-full max-w-[220px] sm:max-w-[300px] md:max-w-[350px] lg:max-w-[470px] bg-gray-100 outline-none resize-none text-xs sm:text-sm md:text-base"
                        />
                        <button
                          onClick={() => handleAddComment(post._id)}
                          className="cursor-pointer font-semibold px-2 sm:px-2.5 md:px-3 lg:px-4 py-1 sm:py-1.5 md:py-2 lg:py-2.5 bg-blue-500 text-white rounded-xl sm:rounded-2xl hover:bg-blue-600 duration-200 text-xs sm:text-sm md:text-base"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Comment Likes Modal */}
              {isOwnProfile && commentLikesClicked && (
                <div className="z-50 h-full w-full bg-black/60 backdrop-blur-sm flex justify-center items-center fixed left-0 top-0 cursor-auto">
                  <div
                    ref={modalRef}
                    className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] w-[90vw] max-w-[300px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[450px] rounded-xl sm:rounded-2xl bg-white overflow-y-auto"
                  >
                    <p className="w-full border-b font-semibold py-2 sm:py-2.5 md:py-3 lg:py-4 border-gray-300 mb-2 sm:mb-2.5 md:mb-3 lg:mb-4 sticky top-0 z-10 bg-white text-xs sm:text-sm md:text-base lg:text-lg text-center">
                      Comment Likes
                    </p>
                    <button
                      onClick={(e) => {
                        setCommentLikesClicked(false);
                        e.stopPropagation();
                      }}
                      className="absolute top-2 sm:top-3 md:top-4 lg:top-5 right-2 sm:right-3 md:right-4 lg:right-5 cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 stroke-black hover:stroke-gray-600 duration-200"
                        viewBox="0 0 16 16"
                      >
                        <path fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m11.25 4.75l-6.5 6.5m0-6.5l6.5 6.5" />
                      </svg>
                    </button>
                    {commentLikes.length === 0 ? (
                      <p className="text-gray-500 text-center mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base">
                        No likes on this comment
                      </p>
                    ) : (
                      commentLikes.map((commentLike) => (
                        <Link
                          to={`/profile/${commentLike._id}`}
                          key={commentLike._id}
                          className="w-full text-left flex py-1 sm:py-1.5 md:py-2 lg:py-2.5 pl-3 sm:pl-4 md:pl-5 lg:pl-6 justify-between"
                        >
                          <div className="flex gap-x-1 sm:gap-x-1.5 md:gap-x-2 lg:gap-x-3">
                            <div className="overflow-hidden rounded-full h-6 sm:h-7 md:h-8 lg:h-10 w-6 sm:w-7 md:w-8 lg:w-10 bg-gray-200 flex justify-center items-center">
                              {commentLike.avatar ? (
                                <img
                                  className="w-full h-full object-cover rounded-full"
                                  src={commentLike.avatar}
                                  alt="comment like avatar"
                                />
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="m-auto w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    fill="gray"
                                    d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2S7.5 4.019 7.5 6.5M20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1z"
                                  />
                                </svg>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <p className="font-semibold text-xs sm:text-sm md:text-base">{commentLike.username}</p>
                              <p className="text-gray-500 text-xs sm:text-sm md:text-base">
                                {commentLike.firstName} {commentLike.lastName || ""}
                              </p>
                            </div>
                          </div>
                          <svg
                            className="mr-2 sm:mr-3 md:mr-4 lg:mr-5 mt-0 sm:mt-1 md:mt-1.5 lg:mt-2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="#e60606"
                              d="m12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53z"
                            />
                          </svg>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {isOwnProfile && (
              <div className="flex-shrink-0">
                <button
                  className="text-xs sm:text-sm md:text-base lg:text-lg font-medium px-1 py-1 hover:border-gray-500 hover:border rounded hover:bg-gray-100 cursor-pointer duration-200"
                  onClick={() =>
                    setPostPopup(postPopup === post._id ? null : post._id)
                  }
                >
                  <BsThreeDotsVertical
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5"
                  />
                </button>
                {postPopup === post._id && (
                  <div className="absolute mt-1 sm:mt-2 md:mt-3 right-2 lg:-right-20 md:-right-20 -sm:right-20 bg-white border rounded shadow p-1 sm:p-2 md:p-3 w-24 sm:w-28 md:w-32 lg:w-36 z-10">
                    <button
                      className="block w-full text-left px-1.5 py-1 text-xs sm:text-sm md:text-base hover:bg-gray-100 border-b border-gray-300"
                      onClick={() => handleEditPost(post._id, post.caption)}
                    >
                      Edit Post
                    </button>
                    <button
                      className="block w-full text-left px-1.5 py-1 text-xs sm:text-sm md:text-base text-red-600 hover:bg-gray-100"
                      onClick={() => handleDeletePost(post._id)}
                    >
                      Delete Post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>

    {/* Followers Modal */}
    {followersClicked && (
      <div className="z-50 h-full w-full bg-black/70 backdrop-blur-sm flex justify-center items-center fixed left-0 top-0 cursor-auto">
        <div
          ref={modalRef}
          className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] w-[90vw] max-w-[300px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[450px] rounded-xl sm:rounded-2xl bg-white overflow-y-auto"
        >
          <p className="w-full border-b font-semibold py-2 sm:py-2.5 md:py-3 lg:py-4 border-gray-300 mb-2 sm:mb-2.5 md:mb-3 sticky top-0 z-10 bg-white text-xs sm:text-sm md:text-base lg:text-lg">
            Followers
          </p>
          <button
            onClick={(e) => {
              setFollowersClicked(false);
              e.stopPropagation();
            }}
            className="absolute top-2 sm:top-3 md:top-4 lg:top-5 right-2 sm:right-3 md:right-4 lg:right-5 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 stroke-black hover:stroke-gray-600 duration-200"
              viewBox="0 0 16 16"
            >
              <path fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m11.25 4.75l-6.5 6.5m0-6.5l6.5 6.5" />
            </svg>
          </button>
          {followers.length === 0 ? (
            <p className="text-gray-500 text-center mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base">
              No followers
            </p>
          ) : (
            followers.map((follower) => (
              <Link
                key={follower._id}
                to={`/profile/${follower._id}`}
                className="w-full text-left flex py-1 sm:py-1.5 md:py-2 lg:py-2.5 pl-3 sm:pl-3.5 md:pl-4 lg:pl-5 justify-between"
              >
                <div className="flex gap-x-1 sm:gap-x-1.5 md:gap-x-2 lg:gap-x-3">
                  <div className="overflow-hidden rounded-full h-6 sm:h-7 md:h-8 lg:h-10 w-6 sm:w-7 md:w-8 lg:w-10 bg-gray-200 flex justify-center items-center">
                    {follower.avatar ? (
                      <img
                        className="w-full h-full object-cover rounded-full"
                        src={follower.avatar}
                        alt="follower avatar"
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="m-auto w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="gray"
                          d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2S7.5 4.019 7.5 6.5M20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <p className="font-semibold text-xs sm:text-sm md:text-base">{follower.username}</p>
                    <p className="text-gray-500 text-xs sm:text-sm md:text-base">
                      {follower.firstName} {follower.lastName || ""}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    )}

    {/* Following Modal */}
    {followingClicked && (
      <div className="z-50 h-full w-full bg-black/70 backdrop-blur-sm flex justify-center items-center fixed left-0 top-0 cursor-auto">
        <div
          ref={modalRef}
          className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] w-[90vw] max-w-[300px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[450px] rounded-xl sm:rounded-2xl bg-white overflow-y-auto"
        >
          <p className="w-full border-b font-semibold py-2 sm:py-2.5 md:py-3 lg:py-4 border-gray-300 mb-2 sm:mb-2.5 md:mb-3 sticky top-0 z-10 bg-white text-xs sm:text-sm md:text-base lg:text-lg">
            Following
          </p>
          <button
            onClick={(e) => {
              setFollowingClicked(false);
              e.stopPropagation();
            }}
            className="absolute top-2 sm:top-3 md:top-4 lg:top-5 right-2 sm:right-3 md:right-4 lg:right-5 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 stroke-black hover:stroke-gray-600 duration-200"
              viewBox="0 0 16 16"
            >
              <path fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m11.25 4.75l-6.5 6.5m0-6.5l6.5 6.5" />
            </svg>
          </button>
          {following.length === 0 ? (
            <p className="text-gray-500 text-center mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base">
              Not following anyone
            </p>
          ) : (
            following.map((follow) => (
              <Link
                key={follow._id}
                to={`/profile/${follow._id}`}
                className="w-full text-left flex py-1 sm:py-1.5 md:py-2 lg:py-2.5 pl-3 sm:pl-3.5 md:pl-4 lg:pl-5 justify-between"
              >
                <div className="flex gap-x-1 sm:gap-x-1.5 md:gap-x-2 lg:gap-x-3">
                  <div className="overflow-hidden rounded-full h-6 sm:h-7 md:h-8 lg:h-10 w-6 sm:w-7 md:w-8 lg:w-10 bg-gray-200 flex justify-center items-center">
                    {follow.avatar ? (
                      <img
                        className="w-full h-full object-cover rounded-full"
                        src={follow.avatar}
                        alt="following avatar"
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="m-auto w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="gray"
                          d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2S7.5 4.019 7.5 6.5M20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <p className="font-semibold text-xs sm:text-sm md:text-base">{follow.username}</p>
                    <p className="text-gray-500 text-xs sm:text-sm md:text-base">
                      {follow.firstName} {follow.lastName || ""}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    )}

    {/* Likes Modal */}
    {isOwnProfile && likesClicked && (
      <div className="z-50 h-full w-full bg-black/50 backdrop-blur-sm flex justify-center items-center fixed left-0 top-0 cursor-auto">
        <div
          ref={modalRef}
          className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] w-[90vw] max-w-[300px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[450px] rounded-xl sm:rounded-2xl bg-white overflow-y-auto"
        >
          <p className="w-full border-b font-semibold py-2 sm:py-2.5 md:py-3 lg:py-4 border-gray-300 mb-2 sm:mb-2.5 md:mb-3 sticky top-0 z-10 bg-white text-xs sm:text-sm md:text-base lg:text-lg">
            Likes
          </p>
          <button
            onClick={(e) => {
              setLikesClicked(false);
              e.stopPropagation();
            }}
            className="absolute top-2 sm:top-3 md:top-4 lg:top-5 right-2 sm:right-3 md:right-4 lg:right-5 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 stroke-black hover:stroke-gray-600 duration-200"
              viewBox="0 0 16 16"
            >
              <path fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m11.25 4.75l-6.5 6.5m0-6.5l6.5 6.5" />
            </svg>
          </button>
          {likes.length === 0 ? (
            <p className="text-gray-500 text-center mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base">
              No likes
            </p>
          ) : (
            likes.map((like) => (
              <Link
                to={`/profile/${like._id}`}
                key={like._id}
                onClick={() => setLikesClicked(false)}
                className="w-full text-left flex py-1 sm:py-1.5 md:py-2 lg:py-2.5 pl-3 sm:pl-3.5 md:pl-4 lg:pl-5 justify-between"
              >
                <div className="flex gap-x-1 sm:gap-x-1.5 md:gap-x-2 lg:gap-x-3">
                  <div className="overflow-hidden rounded-full h-6 sm:h-7 md:h-8 lg:h-10 w-6 sm:w-7 md:w-8 lg:w-10 bg-gray-200 flex justify-center items-center">
                    {like.avatar ? (
                      <img
                        className="w-full h-full object-cover rounded-full"
                        src={like.avatar}
                        alt="like avatar"
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="m-auto w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10"
                        viewBox="0 0 24 24"
                      >
                                               <path
                          fill="gray"
                          d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2S7.5 4.019 7.5 6.5M20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <p className="font-semibold text-xs sm:text-sm md:text-base lg:text-lg">{like.username}</p>
                    <p className="text-gray-500 text-xs sm:text-sm md:text-base lg:text-lg">
                      {like.firstName} {like.lastName || ""}
                    </p>
                  </div>
                </div>
                <svg
                  className="mr-2 sm:mr-3 md:mr-4 lg:mr-5 mt-0 sm:mt-1 md:mt-1.5 lg:mt-2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#e60606"
                    d="m12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53z"
                  />
                </svg>
              </Link>
            ))
          )}
        </div>
      </div>
    )}
  </div>
</div>
)
}

export default YourProfile
