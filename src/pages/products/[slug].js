import Head from "next/head";

import Layout from "@components/Layout";
import Container from "@components/Container";
import Button from "@components/Button";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

import styles from "@styles/Product.module.scss";

export default function Product({ product }) {
  return (
    <Layout>
      <Head>
        <title>{product.name}</title>
        <meta name="description" content="Generated by create next app" />
      </Head>

      <Container>
        <div className={styles.productWrapper}>
          <div className={styles.productImage}>
            <img
              width={product.image.width}
              height={product.image.height}
              src={product.image.url}
              alt=""
            />
          </div>
          <div className={styles.productContent}>
            <h1>{product.name}</h1>
            <div
              className={styles.productDescription}
              dangerouslySetInnerHTML={{
                __html: product.description?.html,
              }}
            />
            <p className={styles.productPrice}>${product.price}</p>
            <p className={styles.productBuy}>
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
          </div>
        </div>
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
      query PageProducts {
        products {
          slug
        }
      }
    `,
  });
  const paths = data.data.products?.map((product) => ({
    params: {
      slug: product.slug,
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
  console.log(resultPaths);
  return {
    paths: resultPaths,
    fallback: false,
  };
}

export async function getStaticProps({ params, locale }) {
  const { slug } = params;
  const client = new ApolloClient({
    uri: "https://api-ap-southeast-2.graphcms.com/v2/cl201gs0b2vrh01xu78h65x10/master",
    cache: new InMemoryCache(),
  });
  const data = await client.query({
    query: gql`
      query PageProduct($slug: String, $locale: Locale!) {
        product(where: { slug: $slug }) {
          id
          image
          name
          price
          description {
            html
          }
          slug
          localizations(locales: [$locale]) {
            description {
              html
            }
          }
        }
      }
    `,
    variables: {
      slug,
      locale,
    },
  });
  let product = data.data.product;
  if (product.localizations.length > 0) {
    console.log("product.localizations", product.localizations);
    product = {
      ...product,
      ...product.localizations[0],
    };
  }
  console.log(product);
  return {
    props: {
      product,
    },
  };
}
