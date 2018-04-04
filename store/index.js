import Vuex from 'vuex';
import axios from 'axios';
import Cookie from 'js-cookie';

const createStore = () => {
    return new Vuex.Store({
        state: {
            loadedPosts: [],
            token: null
        },
        mutations: {
            setPosts(state, posts) {
                state.loadedPosts = posts
            },
            addPost(state, post) {
                state.loadedPosts.push(post);
            },
            editPost(state, editedPost) {
                const postIndex = state.loadedPosts.findIndex(
                    post => post.id === editedPost.id
                );
                state.loadedPosts[postIndex] = editedPost;
            },
            setToken(state, token) {
                state.token = token;
            },
            clearToken(state) {
                state.token = null;
            }
        },
        actions: {
            nuxtServerInit(vuexContext, context) {
                // Cannot put database access data here apparently..
                // Treat this as a special method. Can't rely on this running on the server.
                return axios.get("https://nuxt-blog-98ead.firebaseio.com/posts.json")
                .then(res => {
                    const postsArray = [];
                    for (const key in res.data) {
                        postsArray.push({ ...res.data[key], id: key });
                    }
                    vuexContext.commit('setPosts', postsArray);
                })
                .catch(e => context.error(e));
            },
            authenticateUser(vuexContext, authData) {
                let authUrl = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyBoZ10oJk9-DRK2n4Mi2coa6ULhnJVZMkY";
                if (!authData.isLogin) {
                    authUrl = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyBoZ10oJk9-DRK2n4Mi2coa6ULhnJVZMkY";
                }
                axios.post(authUrl, {
                    email: authData.email,
                    password: authData.password,
                    returnSecureToken: true
                })
                .then(result => {
                    vuexContext.commit('setToken', result.data.idToken);
                    localStorage.setItem('token', result.data.idToken);
                    localStorage.setItem('tokenExpiration', 
                        new Date().getTime() + +result.data.expiresIn * 1000); // when it expires

                    Cookie.set("jwt", result.data.idToken);
                    Cookie.set("expirationDate", 
                        new Date().getTime() + +result.data.expiresIn * 1000);
                    return axios.post('http://localhost:3000/api/track-data', {
                        data: "TESTTEST123"
                    })
                }).catch(e => {
                    console.log(e);
                });
            },
            initAuth(vuexContext, req) {
                let token;
                let expirationDate;
                if (req) { // normal node req object, so detect if it's on the server
                // Never have a req during local generation.
                    if (!req.headers.cookie) {
                        return;
                    }
                    const jwtCookie = req.headers.cookie.split(';')
                    .find(c => c.trim().startsWith('jwt='));
                    if (!jwtCookie) {
                        return;
                    }
                    token = jwtCookie.split('=')[1];
                    expirationDate = req.headers.cookie
                    .split(';')
                    .find(c => c.trim().startsWith('expirationDate='))
                    .split('=')[1];
                }   else if (process.client) {
                    token = localStorage.getItem('token');
                    expirationDate = localStorage.getItem("tokenExpiration");
                }
                // This happens after the initial client/server if else
                if (new Date().getTime() > +expirationDate || !token) {
                    vuexContext.dispatch('logout');
                    return;
                }
                vuexContext.commit('setToken', token);
            },
            setPosts(vuexContext, posts) {
                vuexContext.commit('setPosts', posts)
            },
            addPost(vuexContext, post) {
                const createdPost = {
                    ...post, updatedDate: new Date()
                };

                return axios.post('https://nuxt-blog-98ead.firebaseio.com/posts.json?auth=' + vuexContext.state.token, createdPost)
                .then(result => {
                    vuexContext.commit('addPost', {...createdPost, id: result.data.name});
                })
                .catch(error => console.log(error));
            },
            editPost(vuexContext, editedPost) {
                return axios.put("https://nuxt-blog-98ead.firebaseio.com/posts/" + 
                    editedPost.id + 
                    '.json?auth=' + vuexContext.state.token, {...editedPost, updatedDate: new Date()
                    }).then(res => {
                        vuexContext.commit('editPost', editedPost);
                    }).catch(e => console.log(e));
            },
            logout(vueContext) {
                vueContext.commit('clearToken');
                Cookie.remove('jwt');
                Cookie.remove('expirationDate');
                if (process.client) { // check if we are running via client
                    localStorage.removeItem('token');
                    localStorage.removeItem('tokenExpiration');
                }
            }
        },
        getters: {
            loadedPosts(state) {
                return state.loadedPosts
            },
            isAuthenticated(state) {
                return state.token != null;
            }
        }
    });
}

export default createStore