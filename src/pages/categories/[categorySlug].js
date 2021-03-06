import Head from "next/head";

import Layout from "@components/Layout";
import Container from "@components/Container";
import Button from "@components/Button";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

import styles from "@styles/Page.module.scss";
import Link from "next/link";
import { buildImg } from "@lib/cloudinary";

export default function Category({ category, products }) {
  return (
    <Layout>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
      </Head>

      <Container>
        <h1>{category.name}</h1>

        <h2>Products</h2>

        <ul className={styles.products}>
          {products.map((product) => {
            const imgUrl = buildImg(product.image.public_id)
              .resize("w_900,h_900")
              .toURL();
            return (
              <li key={product.id}>
                <Link href={`/products/${product.slug}`}>
                  <a>
                    <div className={styles.productImage}>
                      <img width={900} height={900} src={imgUrl} alt="" />
                    </div>
                    <h3 className={styles.productTitle}>{product.name}</h3>
                    <p className={styles.productPrice}>${product.price}</p>
                  </a>
                </Link>
                <p>
                  <Button
                    className="snipcart-add-item"
                    data-item-id={product.id}
                    data-item-price={product.price}
                    data-item-url={`/products/${product.slug}`}
                    data-item-image={product.image.url}
                    data-item-name={product.name}
                  >
                    Add to Cart
                  </Button>
                </p>
              </li>
            );
          })}
        </ul>
      </Container>
    </Layout>
  );
}

export async function getStaticPaths({ locales }) {
  const client = new ApolloClient({
    uri: "https://api-ap-southeast-2.graphcms.com/v2/cl201gs0b2vrh01xu78h65x10/master",
    cache: new InMemoryCache(),
  });
  const data = await client.query({
    query: gql`
      query PageCategories {
        categories {
          id
          slug
        }
      }
    `,
  });
  const paths = data.data.categories?.map((category) => ({
    params: {
      categorySlug: category.slug, // 'categorySlug' should be the same with the file name as param
    },
  }));
  const resultPaths = [
    ...paths,
    ...paths.flatMap((path) =>
      locales.map((locale) => ({
        ...path,
        locale,
      }))
    ),
  ];
  return {
    paths: resultPaths,
    fallback: false,
  };
}

export async function getStaticProps({ params, locales }) {
  const { categorySlug } = params;
  const client = new ApolloClient({
    uri: "https://api-ap-southeast-2.graphcms.com/v2/cl201gs0b2vrh01xu78h65x10/master",
    cache: new InMemoryCache(),
  });
  const data = await client.query({
    query: gql`
      query PageCategory($slug: String) {
        category(where: { slug: $slug }) {
          id
          name
          slug
          products {
            id
            name
            image
            price
            slug
          }
        }
      }
    `,
    variables: {
      slug: categorySlug,
    },
  });
  const category = data.data.category;
  return {
    props: {
      category,
      products: category.products,
    },
  };
}
