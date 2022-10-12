import styles from '../../styles/Slug.module.css'
import {GraphQLClient, gql} from 'graphql-request'
const graphCMS = new GraphQLClient("https://api-us-west-2.hygraph.com/v2/cl95t1j8b6k1701ul81wo6gkt/master") //

//create a query. this query finds the specific post that slug matches
const postQuery = gql`
    query Post($slug: String!) {
        post(where: {slug: $slug}) {
            id 
            title 
            slug
            datePublished
            author {
                id,
                name, 
                avatar {
                    url
                }
            }
            content {
                html
            }
            coverPhoto {
                id
                url
            }
        }
    }
`

//is a query that gets all the blog post slugs
const slugList = gql`
    {
        posts {
            slug
        }
    }
`

//tells next how to generate our pages.
//this makes a request to our api, finds all available paths. Then we pass those available paths to our getStaticProps in the params property
export async function getStaticPaths() {
    const {posts} = await graphCMS.request(slugList)
    // paths: ["the-world-of-web-development-in-2022", "i-made-this-post", "iloveseanbalayan"  ] these are the paths we want to use and generate. we can generate these paths by making a request to our sluglist

    return {
        paths: posts.map(post => ({params: {slug: post.slug}})),
        fallback: false, //error handling if a page doesn't exist for instance
    }   
}

export async function getStaticProps({params}) {
    const slug = params.slug
    const data = await graphCMS.request(postQuery, {slug}) //makes an api call. v similar to a fetch request
    const post = data.post
    //when you use getStaticProps, you always want to return something here in props. The props property gets passed into the home component
    return  {
      props: {
        post
      },
      revalidate: 10 //since these pages are statically generated, we can use the revalidate property to regenerate the static pages in case the api gets updated. here we revalidate every 10 seconds. check to see if the revalidate is on auto
    }
  }

export default function BlogPost({post}) {
    return (
        <main className={styles.blog}>
            <img className={styles.cover} src={post.coverPhoto.url} alt=""/>
            <div className={styles.title}>
                <img src={post.author.avatar.url} alt=''/>
                <div className={styles.authtext}>
                    <h6>By {post.author.name}</h6>
                    <h6 className={styles.date}>{post.datePublished}</h6>
                </div>
            </div>
            <h2>{post.title}</h2>
            <div className={styles.content} dangerouslySetInnerHTML={{__html: post.content.html}}></div>
        </main>
    )
}