import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsThreeDotsVertical } from 'react-icons/bs';
import {getAllPosts, addComment, togglePostLike, toggleCommentLike, editPost, deletePost, deleteComment, getPostComments, getCurrentUser, getPostLikes, getCommentLikes, getPostById,} from '../api.js';

function Home() {
  let navigate = useNavigate()
  let modalRef = useRef(null)

  let [posts, setPosts] = useState([])
  let [comments, setComments] = useState([])
  let [newComment, setNewComment] = useState('')
  let [commentsClicked, setCommentsClicked] = useState(false)
  let [selectedPostId, setSelectedPostId] = useState(null)
  let [mediaClicked, setMediaClicked] = useState(null)
  let [likesClicked, setLikesClicked] = useState(false)
  let [likes, setLikes] = useState([])
  let [commentLikesClicked, setCommentLikesClicked] = useState(false)
  let [commentLikes, setCommentLikes] = useState([])
  let [editingPostId, setEditingPostId] = useState(null)
  let [editedCaption, setEditedCaption] = useState('')
  let [postPopup, setPostPopup] = useState(null)
  let [loading, setLoading] = useState(true)
  let [error, setError] = useState(null)
  let [user, setUser] = useState(null)

  useEffect(() => {
    let handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setMediaClicked(null)
        setCommentsClicked(false)
        setSelectedPostId(null)
        setLikesClicked(false)
        setCommentLikesClicked(false)
        setPostPopup(null)
        setEditingPostId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [])

 useEffect(() => {
  let fetchData = async () => {
    try {
      setLoading(true);
      let userResponse = await getCurrentUser();
      setUser(userResponse.data || { _id: null, avatar: null });

      let postsResponse = await getAllPosts();
      let postsWithLikesAndComments = await Promise.all(
        postsResponse.data.posts.map(async (post) => {
          let postDetailResponse = await getPostById(post._id);
          return {
            ...postDetailResponse.data,
            likes: postDetailResponse.data.likes || [],
            comments: postDetailResponse.data.comments || []
          };
        })
      );

      setPosts(postsWithLikesAndComments);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load posts or user data');
    if (error.response && error.response.status === 401) {
        handleUnauthorized();
      } else {
        setError('Failed to load posts or user data');
      }
    } finally {
      setLoading(false);
    }
  }

  let handleUnauthorized = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    navigate("/login")
  }

  fetchData()
}, [navigate])

  let handleTogglePostLike = async (postId) => {
    try {
      let response = await togglePostLike(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, likes: response.data?.likes || [] } : post
        )
      );
    } catch (error) {
      console.error('Failed to toggle like:', error);
      alert('Failed to toggle like');
    }
  }

  let handleCommentsClicked = async (postId) => {
    setCommentsClicked(true)
    setSelectedPostId(postId)
    setComments([]);
    try {
      let response = await getPostComments(postId);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([])
    }
  }

  let handleAddComment = async (postId) => {
    if (!newComment.trim()) {
      alert('Add a comment');
      return;
    }
    try {
      await addComment(postId, newComment);
      setNewComment('');
      let response = await getPostComments(postId);
      setComments(response.data.comments || []);
      
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId 
      ? { ...post, comments: response.data?.comments, likes: post.likes || [] } 
      : post
        )
      );
    } catch (error) {
      console.error('Failed to add comment:', error.response?.data?.message || error.message);
      alert(`Failed to add comment: ${error.response?.data?.message || 'Please try again.'}`);
    }
  }

  let handleToggleCommentLike = async (postId, commentId) => {
    try {
      let response = await toggleCommentLike(postId, commentId);
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId ? { ...comment, likes: response.data?.likes || [] } : comment
        )
      );
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment._id === commentId ? { ...comment, likes: response.data?.likes || [] } : comment
                ),
              }
            : post
        )
      );
    } catch (error) {
      console.error('Failed to toggle comment like:', error);
      alert('Failed to toggle comment like');
    }
  }

  let handleDeleteComment = async (postId, commentId) => {
    try {
      await deleteComment(postId, commentId);
      setComments((prev) => prev.filter((comment) => comment._id !== commentId));
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, comments: post.comments - 1, likes: post.likes } : post
        )
      );
    } catch (error) {
      console.error('Failed to delete comment:', error)
      alert('Failed to delete comment');
    }
  }

  let handleLikesClicked = async (postId) => {
    setLikesClicked(true);
    try {
      let response = await getPostLikes(postId);
      setLikes(response.data?.likes || []);
    } catch (error) {
      console.error('Error fetching likes:', error);
      setLikes([]);
    }
  }

  let handleCommentsLikeClicked = async (postId, commentId) => {
    setCommentLikesClicked(true);
    try {
      let response = await getCommentLikes(postId, commentId);
      setCommentLikes(response.data?.likes || []);
    } catch (error) {
      console.error('Error fetching comment likes:', error);
      setCommentLikes([]);
    }
  }

  let handlePostPopup = (postId) => {
    setPostPopup(postPopup === postId ? null : postId);
  }

  let handleEditPost = (postId) => {
    let post = posts.find((p) => p._id === postId);
    setEditingPostId(postId);
    setEditedCaption(post?.caption || '');
  }

  let handleSaveEdit = async () => {
    if (!editedCaption.trim()) {
      alert('Caption cannot be empty');
      return;
    }
    try {
      await editPost(editingPostId, editedCaption);
      setPosts((prev) =>
        prev.map((post) =>
          post._id === editingPostId ? { ...post, caption: editedCaption } : post
        )
      );
      setEditingPostId(null);
      setEditedCaption('');
      setPostPopup(null);
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post');
    }
  }

  let handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((post) => post._id !== postId));
      setPostPopup(null);
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  }

  let handleMedia = (postId) => {
    setMediaClicked(postId);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <>
<div className="flex justify-center px-2 sm:px-4 md:px-6 lg:px-8">
  <div className="flex items-center bg-white border border-gray-500 my-2 sm:my-3 md:my-4 rounded-xl sm:rounded-2xl w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] px-2 sm:px-3 md:px-4 py-1 sm:py-2 md:py-3">
    <Link to={`/profile/${user._id}`} className="mr-2 sm:mr-3 md:mr-4 lg:mr-5">
      <div className="h-6 sm:h-8 md:h-10 lg:h-[50px] w-6 sm:w-8 md:w-10 lg:w-[50px] rounded-full bg-gray-300 overflow-hidden flex justify-center items-center">
        {user?.avatar ? (
          <img className="w-full h-full object-cover rounded-full" src={user.avatar} alt="User" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="m-auto w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10">
            <path fill="gray" d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2S7.5 4.019 7.5 6.5M20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1z" />
          </svg>
        )}
      </div>
    </Link>
    <p className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-2xl font-light cursor-default">
      What's happening {user.firstName}?
    </p>
  </div>
</div>

<div className="flex flex-col justify-center items-center gap-y-2 sm:gap-y-3 md:gap-y-4 px-2 sm:px-3 md:px-4 lg:px-8">
  {posts.length === 0 ? (
    <p className="text-center text-gray-600 mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base">No posts available.</p>
  ) : (
    posts.map((post) => (
      <div ref={modalRef} key={post._id} className="p-2 sm:p-3 md:p-4 lg:p-5 border border-gray-500 w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] flex justify-between">
          <Link to={`/profile/${post.createdBy._id}`} className="h-6 sm:h-7 md:h-8 lg:h-10 w-6 sm:w-7 md:w-8 lg:w-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0 mr-2 sm:mr-3 md:mr-4 lg:mr-5">
            {post.createdBy?.avatar ? (
              <img className="w-full h-full object-cover rounded-full" src={post.createdBy.avatar}/>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="m-auto w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10">
                <path fill="gray" d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2S7.5 4.019 7.5 6.5M20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1z" />
              </svg>
            )}
          </Link>

           <div className="flex-1"> 
          <div className="flex gap-x-1 sm:gap-x-2 md:gap-x-2 lg:gap-x-4 flex-wrap">
            <Link to={`/profile/${post.createdBy._id}`} className="font-semibold hover:underline text-xs sm:text-sm md:text-sm lg:text-base">
              {post.createdBy?.firstName} {post.createdBy?.lastName || ''}
            </Link>
            <Link to={`/profile/${post.createdBy._id}`} className="text-gray-500 text-xs sm:text-sm">
              @{post.createdBy?.username}
            </Link>
            <p className="text-gray-500 text-xs sm:text-sm">
              {(() => {
                const now = new Date();
                const postDate = new Date(post.createdAt);
                const diffInSeconds = Math.floor((now - postDate) / 1000);
                if (diffInSeconds < 60) return `${diffInSeconds}s`;
                if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
                if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
                return postDate.toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
              })()}
            </p>
          </div>

          {editingPostId === post._id ? (
            <div className="flex space-x-1 sm:space-x-1.5 md:space-x-2 mt-1 sm:mt-1.5 md:mt-2">
              <input type="text" value={editedCaption} onChange={(e) => setEditedCaption(e.target.value)} className="border px-1 sm:px-1.5 md:px-2 py-1 w-full focus:outline-none outline-none text-xs sm:text-sm md:text-sm lg:text-base" />
              <button onClick={handleSaveEdit} className="px-1 sm:px-1.5 md:px-2 lg:px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs sm:text-sm">
                Save
              </button>
            </div>
          ) : (
            <div className="text-left text-xs xs:text-xs sm:text-sm md:text-base break-words w-[220px] sm:max-w-[200px] md:max-w-[400px] lg:max-w-[450px]">
              {post.caption}
            </div>
          )}

          {post.mediaFile && (
            <Link onClick={() => handleMedia(post._id)}>
              {!post.caption ? (
                <div className="rounded-xl sm:rounded-2xl mt-2 sm:mt-3 md:mt-4 lg:mt-5 overflow-hidden">
                  <div className="w-[220px] sm:w-[280px] md:w-[340px] lg:w-[400px] xl:w-[460px]">
                    {post.mediaFile.endsWith('.mp4') || post.mediaFile.endsWith('.webm') || post.mediaFile.endsWith('.ogg') ? (
                      <video controls className="w-full h-auto rounded-xl sm:rounded-2xl object-cover">
                        <source src={post.mediaFile} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img className="w-full h-auto rounded-xl sm:rounded-2xl object-cover" src={post.mediaFile} />
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl sm:rounded-2xl mt-1 sm:mt-2 md:mt-3 lg:mt-4 overflow-hidden">
                  <div className="w-[220px] sm:w-[280px] md:w-[340px] lg:w-[400px] xl:w-[460px]">
                    {post.mediaFile.endsWith('.mp4') || post.mediaFile.endsWith('.webm') || post.mediaFile.endsWith('.ogg') ? (
                      <video controls className="w-full h-auto rounded-xl sm:rounded-2xl object-cover">
                        <source src={post.mediaFile} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img className="w-full h-auto rounded-xl sm:rounded-2xl object-cover" src={post.mediaFile} />
                    )}
                  </div>
                </div>
              )}
            </Link>
          )}

          {mediaClicked === post._id && post.mediaFile?.trim() && (
            <div className="w-full h-full py-2 sm:py-4 md:py-6 lg:py-8 bg-black/60 backdrop-blur-sm z-50 flex justify-center fixed left-0 top-0">
           
              <button onClick={() => setMediaClicked(null)} className="absolute top-2 sm:top-3 md:top-4 lg:top-6 left-2 sm:left-3 md:left-4 lg:left-6 cursor-pointer">
                <svg className="fill-black hover:fill-gray-600 duration-200" xmlns="http://www.w3.org/2000/svg" width="16" sm="18" md="20" lg="26" height="16" sm="18" md="20" lg="26" viewBox="0 0 64 64">
                  <path d="M62 10.571L53.429 2L32 23.429L10.571 2L2 10.571L23.429 32L2 53.429L10.571 62L32 40.571L53.429 62L62 53.429L40.571 32z" />
                </svg>
              </button>

              <div ref={modalRef} className="max-w-[270px]">
                {post.mediaFile.endsWith('.mp4') || post.mediaFile.endsWith('.webm') || post.mediaFile.endsWith('.ogg') ? (
                  <video controls className="w-full h-full object-contain">
                    <source src={post.mediaFile} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img className="w-full h-full object-contain" src={post.mediaFile} />
                )}
              </div>
            </div>
          )}

         <div className="flex gap-x-4 sm:gap-x-6 md:gap-x-8 lg:gap-x-14 mt-1 sm:mt-1.5 md:mt-2 lg:mt-3">
  {/* Like Button */}
  <div className="flex gap-x-0.5 sm:gap-x-1 md:gap-x-1 lg:gap-x-1.5 group">
    <button onClick={() => handleTogglePostLike(post._id)} className="cursor-pointer">
      <svg
        className={`${
          post.likes?.includes(user?._id)
            ? 'fill-pink-500 stroke-pink-500'
            : 'stroke-gray-400 fill-none group-hover:stroke-pink-500 duration-200'
        } w-4 h-4 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="m12 21l-8.8-8.3A5.6 5.6 0 1 1 12 6a5.6 5.6 0 1 1 8.9 6.6z"
        />
      </svg>
    </button>
    <button
      onClick={() => user?._id === post.createdBy?._id && handleLikesClicked(post._id)}
      className={`group-hover:text-pink-500 duration-200 cursor-pointer text-xs sm:text-sm md:text-base lg:text-lg ${
        post.likes?.includes(user?._id) ? 'text-pink-500' : 'text-gray-600'
      }`}
    >
      {post.likes.length}
    </button>
  </div>

  {/* Comment Button */}
  <button
    onClick={() => handleCommentsClicked(post._id)}
    className="flex gap-x-0.5 sm:gap-x-1 md:gap-x-1 lg:gap-x-1 cursor-pointer group"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7"
      viewBox="0 0 24 24"
    >
      <path
        fill="none"
        className="stroke-gray-400 group-hover:stroke-blue-500 duration-200"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 21a9 9 0 1 0-9-9c0 1.488.36 2.891 1 4.127L3 21l4.873-1c1.236.64 2.64 1 4.127 1"
      />
    </svg>
    <p className="group-hover:text-blue-500 duration-200 text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg">
      {post.comments.length}
    </p>
  </button>
</div>

          {likesClicked && user?._id === post.createdBy?._id && (
            <div className="z-50 h-full w-full bg-black/50 backdrop-blur-sm flex justify-center items-center fixed left-0 top-0 cursor-auto">
              <div ref={modalRef} className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[400px] w-[250px] sm:w-[280px] md:w-[300px] lg:w-[350px] rounded-xl sm:rounded-2xl bg-white overflow-y-auto">
                <p className="w-full border-b font-semibold py-1 sm:py-1.5 md:py-2 lg:py-2.5 border-gray-300 mb-1 sm:mb-1.5 md:mb-2 sticky top-0 z-10 bg-white text-xs sm:text-sm md:text-base">
                  Likes
                </p>

                <button onClick={(e) => { setLikesClicked(false); e.stopPropagation(); }} className="absolute cursor-pointer top-6 sm:top-7 md:top-8 lg:top-[84px] right-2 sm:right-3 md:right-4 lg:right-[464px] z-20">
                  <svg className="stroke-black hover:stroke-gray-600 duration-200" xmlns="http://www.w3.org/2000/svg" width="20" sm="22" md="24" lg="28" height="20" sm="22" md="24" lg="28" viewBox="0 0 16 16">
                    <path fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m11.25 4.75l-6.5 6.5m0-6.5l6.5 6.5" />
                  </svg>
                </button>

                {likes.length === 0 ? (
                  <p className="text-gray-500 text-center mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm">No likes</p>
                ) : (
                  likes.map((like) => (
                    <Link to={`/profile/${like._id}`} key={like._id} onClick={() => setLikesClicked(false)} className="w-full text-left flex py-1 sm:py-1.5 md:py-2 lg:py-2.5 pl-3 sm:pl-3.5 md:pl-4 lg:pl-5 justify-between">
                      <div className="flex gap-x-1 sm:gap-x-1.5 md:gap-x-2">
                        <div className="overflow-hidden cursor-pointer rounded-full h-6 sm:h-7 md:h-8 lg:h-[50px] w-6 sm:w-7 md:w-8 lg:w-[50px] bg-gray-200 flex justify-center items-center">
                          {like.avatar ? (
                            <img className="w-full h-full object-cover rounded-full" src={like.avatar} />
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="m-auto w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10">
                              <path fill="gray" d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2S7.5 4.019 7.5 6.5M20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1z" />
                            </svg>
                          )}
                        </div>

                        <Link to={`/profile/${like.likedBy?._id}`} className="flex flex-col">
                          <p className="font-semibold text-xs sm:text-sm">{like.username}</p>
                          <p className="text-gray-500 text-xs sm:text-sm">
                            {like.firstName} {like.lastName || ''}
                          </p>
                        </Link>
                      </div>
                      <svg className="mr-1 sm:mr-2 md:mr-3 lg:mr-4 mt-0.5 sm:mt-1 md:mt-1 lg:mt-2" xmlns="http://www.w3.org/2000/svg" width="16" sm="18" md="20" lg="24" height="16" sm="18" md="20" lg="24" viewBox="0 0 24 24">
                        <path fill="#e60606" d="m12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53z" />
                      </svg>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}

          {commentsClicked && selectedPostId === post._id && (
            <div className="z-50 h-full w-full bg-black/60 backdrop-blur-sm flex justify-center items-center fixed left-0 top-0 cursor-auto">
              <div ref={modalRef} className="h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] w-[90vw] max-w-[400px] sm:max-w-[500px] md:max-w-[550px] lg:max-w-[650px] rounded-xl sm:rounded-2xl md:rounded-3xl bg-white px-2 sm:px-3 md:px-4 lg:px-7 overflow-y-auto">
                <p className="w-full border-b font-semibold py-2 sm:py-2.5 md:py-3 lg:py-5 border-gray-300 mb-2 sm:mb-2.5 md:mb-3 lg:mb-4 sticky top-0 z-10 bg-white text-xs sm:text-sm md:text-base">
                  Comments
                </p>

                <button onClick={(e) => { setCommentsClicked(false); setSelectedPostId(null); e.stopPropagation(); }} className="absolute cursor-pointer top-6 sm:top-7 md:top-8 lg:top-[60px] right-2 sm:right-3 md:right-4 lg:right-[320px] z-20">
                  <svg className="stroke-black hover:stroke-gray-600 duration-200" xmlns="http://www.w3.org/2000/svg" width="20" sm="22" md="24" lg="28" height="20" sm="22" md="24" lg="28" viewBox="0 0 16 16">
                    <path fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m11.25 4.75l-6.5 6.5m0-6.5l6.5 6.5" />
                  </svg>
                </button>

                <div className="flex flex-col gap-y-3 sm:gap-y-4 md:gap-y-4 lg:gap-y-6 mb-8 sm:mb-10 md:mb-12 lg:mb-15">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm">No comments</p>
                  ) : (
                    comments.map((aComment) => (
                      <div key={aComment._id} className="text-left flex gap-x-1 sm:gap-x-1.5 md:gap-x-2 cursor-pointer">
                        {aComment.commentedBy ? (
                          <Link to={`/profile/${aComment.commentedBy?._id}`} onClick={() => setCommentsClicked(false)}>
                            <div className="overflow-hidden cursor-pointer rounded-full h-6 sm:h-7 md:h-8 lg:h-[40px] w-6 sm:w-7 md:w-8 lg:w-[40px] bg-gray-200 flex justify-center items-center">
                              {aComment.commentedBy.avatar ? (
                                <img src={aComment.commentedBy.avatar} className="w-full h-full object-cover rounded-full" />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="m-auto w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10">
                                  <path fill="gray" d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2S7.5 4.019 7.5 6.5M20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1z" />
                                </svg>
                              )}
                            </div>
                          </Link>
                        ) : (
                          <div className="overflow-hidden rounded-full h-6 sm:h-7 md:h-8 lg:h-[40px] w-6 sm:w-7 md:w-8 lg:w-[40px] bg-gray-200 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="m-auto w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10">
                              <path fill="gray" d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2S7.5 4.019 7.5 6.5M20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1z" />
                            </svg>
                          </div>
                        )}

                        <div className="flex flex-col w-full">
                          <div className="flex flex-col text-left bg-gray-100 rounded-xl sm:rounded-2xl px-1 sm:px-1.5 md:px-2 lg:px-3 py-1 sm:py-1.5">
                            <Link to={`/profile/${aComment.commentedBy?._id}`} onClick={() => setCommentsClicked(false)} className="text-xs sm:text-sm font-semibold">
                              {aComment.commentedBy?.username || 'Unknown User'}
                            </Link>
                            <p className="text-xs sm:text-sm">{aComment.comment}</p>
                          </div>

                          <div className="flex gap-x-1 sm:gap-x-1.5 md:gap-x-2">
                            <button onClick={() => user?._id === post.createdBy?._id && handleCommentsLikeClicked(post._id, aComment._id)} className="flex gap-x-0.5 sm:gap-x-1 md:gap-x-1 lg:gap-x-1 cursor-pointer text-xs sm:text-sm text-gray-500 ml-0.5 sm:ml-1 md:ml-1 lg:ml-2 mt-0.5 sm:mt-0.5 md:mt-0.5 lg:mt-1 hover:text-blue-500">
                              <p>{aComment.likes?.length || 0}</p>
                              <p>Likes</p>
                            </button>

                            <button onClick={() => handleToggleCommentLike(post._id, aComment._id)} className="cursor-pointer relative top-0.5 sm:top-0.5 md:top-0.5 lg:top-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" sm="15" md="16" lg="20" height="14" sm="15" md="16" lg="20" viewBox="0 0 24 24">
                                <path className={`${aComment.likes?.includes(user?._id) ? 'fill-red-600 stroke-red-600' : 'fill-none stroke-gray-400'}`} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 3C4.239 3 2 5.216 2 7.95c0 2.207.875 7.445 9.488 12.74a.99.99 0 0 0 1.024 0C21.126 15.395 22 10.157 22 7.95C22 5.216 19.761 3 17 3s-5 3-5 3s-2.239-3-5-3" />
                              </svg>
                            </button>

                            {(aComment.commentedBy?._id === user?._id || post.createdBy?._id === user?._id) && (
                              <button onClick={() => handleDeleteComment(post._id, aComment._id)} className="group cursor-pointer pt-0.5 sm:pt-1 md:pt-1 lg:pt-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" sm="15" md="16" lg="20" height="14" sm="15" md="16" lg="20" viewBox="0 0 24 24">
                                  <g fill="none">
                                    <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.20-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.10-.01z" />
                                    <path className="fill-gray-500 group-hover:fill-red-500 duration-200" d="M20 5a1 1 0 1 1 0 2h-1l-.003.071l-.933 13.071A2 2 0 0 1 16.069 22H7.93a2 2 0 0 1-1.995-1.858l-.933-13.07L5 7H4a1 1 0 0 1 0-2zm-6-3a1 1 0 1 1 0 2h-4a1 1 0 0 1 0-2z" />
                                  </g>
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  <div className="flex items-center gap-x-2 sm:gap-x-3 px-3 py-2 border-t bg-white w-full sticky bottom-0">
                    <Link to={`/profile/${user._id}`} onClick={() => setCommentsClicked(false)}>
                      <div className="overflow-hidden rounded-full h-6 sm:h-7 md:h-8 lg:h-[40px] w-6 sm:w-7 md:w-8 lg:w-[40px] bg-gray-200 flex items-center justify-center">
                        {user?.avatar ? (
                          <img className="w-full h-full object-cover rounded-full" src={user.avatar} />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="m-auto w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10">
                            <path fill="gray" d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2S7.5 4.019 7.5 6.5M20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1z" />
                          </svg>
                        )}
                      </div>
                    </Link>
                    <textarea placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="rounded-xl sm:rounded-2xl pl-1 sm:pl-1.5 md:pl-2 lg:pl-3 w-full max-w-[250px] sm:max-w-[300px] md:max-w-[350px] lg:max-w-[380px] xl:max-w-[470px] bg-gray-100 outline-none resize-none text-xs sm:text-sm" />
                    <button onClick={() => handleAddComment(post._id)} className="cursor-pointer font-semibold px-2 sm:px-2.5 md:px-3 lg:px-4 py-1 sm:py-1.5 md:py-1.5 lg:py-2 bg-blue-500 text-white rounded-xl sm:rounded-2xl hover:bg-blue-600 duration-200 text-xs sm:text-sm">
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {commentLikesClicked && user?._id === post.createdBy?._id && (
            <div className="z-50 h-full w-full bg-black/60 backdrop-blur-sm flex justify-center items-center fixed left-0 top-0 cursor-auto">
              <div ref={modalRef} className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[400px] w-[250px] sm:w-[280px] md:w-[300px] lg:w-[350px] rounded-xl sm:rounded-2xl bg-white overflow-y-auto">
                <p className="w-full border-b font-semibold py-1 sm:py-1.5 md:py-2 lg:py-2.5 border-gray-300 mb-1 sm:mb-1.5 md:mb-2 text-center sticky top-0 z-10 bg-white text-xs sm:text-sm md:text-base">
                  Comment Likes
                </p>

                <button onClick={(e) => { setCommentLikesClicked(false); e.stopPropagation(); }} className="absolute cursor-pointer top-6 sm:top-7 md:top-8 lg:top-[84px] right-2 sm:right-3 md:right-4 lg:right-[464px] z-20">
                  <svg className="stroke-black hover:stroke-gray-600 duration-200" xmlns="http://www.w3.org/2000/svg" width="20" sm="22" md="24" lg="28" height="20" sm="22" md="24" lg="28" viewBox="0 0 16 16">
                    <path fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m11.25 4.75l-6.5 6.5m0-6.5l6.5 6.5" />
                  </svg>
                </button>

                {commentLikes.length === 0 ? (
                  <p className="text-gray-500 text-center mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm">No likes on this comment</p>
                ) : (
                  commentLikes.map((commentLike) => (
                    <Link key={commentLike._id} to={`/profile/${commentLike._id}`} onClick={() => setCommentLikesClicked(false)} className="w-full text-left flex py-1 sm:py-1.5 md:py-2 lg:py-2.5 pl-3 sm:pl-3.5 md:pl-4 lg:pl-5 justify-between">
                      <div className="flex gap-x-1 sm:gap-x-1.5 md:gap-x-2">
                        <div className="overflow-hidden cursor-pointer rounded-full h-6 sm:h-7 md:h-8 lg:h-[50px] w-6 sm:w-7 md:w-8 lg:w-[50px] bg-gray-200 flex justify-center items-center">
                          {commentLike.avatar ? (
                            <img className="w-full h-full object-cover rounded-full" src={commentLike.avatar} />
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="m-auto w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10">
                              <path fill="gray" d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2S7.5 4.019 7.5 6.5M20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1z" />
                            </svg>
                          )}
                        </div>

                        <Link to={`/profile/${commentLike._id}`} className="flex flex-col">
                          <p className="font-semibold text-xs sm:text-sm">{commentLike.username}</p>
                          <p className="text-gray-500 text-xs sm:text-sm">
                            {commentLike.firstName} {commentLike.lastName || ''}
                          </p>
                        </Link>
                      </div>
                      <svg className="mr-1 sm:mr-2 md:mr-3 lg:mr-4 mt-0.5 sm:mt-1 md:mt-1 lg:mt-2" xmlns="http://www.w3.org/2000/svg" width="16" sm="18" md="20" lg="24" height="16" sm="18" md="20" lg="24" viewBox="0 0 24 24">
                        <path fill="#e60606" d="m12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53z" />
                      </svg>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

          {user?._id === post.createdBy?._id && (
            <div className="flex-shrink-0">
              <button className="text-xs sm:text-sm md:text-base font-medium px-1 py-1 hover:border-gray-500 hover:border rounded hover:bg-gray-100 cursor-pointer duration-200" 
              onClick={() => handlePostPopup(post._id)}>
                <BsThreeDotsVertical className='w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5'/>
              </button>

              {postPopup === post._id && (
                <div className="absolute mt-1 sm:mt-2 md:mt-3 right-2 lg:right-60 md:right-50 sm:right-50 bg-white border rounded shadow p-1 sm:p-2 md:p-3 w-24 sm:w-28 md:w-32 lg:w-36 z-10">
                  <button className="block w-full text-left px-1.5 py-1 text-xs sm:text-sm md:text-base hover:bg-gray-100 border-b border-gray-300" onClick={() => handleEditPost(post._id)}>
                    Edit Post
                  </button>
                  <button className="block w-full text-left px-1.5 py-1 text-xs sm:text-sm md:text-base text-red-600 hover:bg-gray-100" onClick={() => handleDeletePost(post._id)}>
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
</>
  )
}

export default Home