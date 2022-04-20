import Head from "next/head";
import Link from "next/link";

import Layout from "@components/Layout";
import Container from "@components/Container";
import Button from "@components/Button";

import styles from "@styles/Page.module.scss";

import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { buildImg } from "@lib/cloudinary";

export default function Home({ home, featuredProducts }) {
  const { heroTitle, heroText, heroLink, heroBg } = home;
  const heroBgUrl = buildImg(heroBg.public_id).toURL();
  console.log(heroBgUrl);
  return (
    <Layout>
      <Head>
        <title>Space Jelly Gear</title>
        <meta name="description" content="Get your Space Jelly gear!" />
      </Head>

      <Container>
        <h1 className="sr-only">Space Jelly Gear</h1>

        <div className={styles.hero}>
          <Link href={heroLink}>
            <a>
              <div className={styles.heroContent}>
                <h2>{heroTitle}</h2>
                <p>{heroText}</p>
              </div>
              <img
                className={styles.heroImage}
                src={buildImg(heroBg.public_id).toURL()}
                alt=""
              />
            </a>
          </Link>
        </div>

        <h2 className={styles.heading}>Featured Gear</h2>

        <ul className={styles.products}>
          {featuredProducts.map((product) => {
            return (
              <li key={product.slug}>
                <Link href={`/products/${product.slug}`}>
                  <a>
                    <div className={styles.productImage}>
                      <img
                        width={product.image.width}
                        height={product.image.height}
                        src={buildImg(product.image.public_id).toURL()}
                        alt=""
                      />
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

export async function getStaticProps({ locale }) {
  const client = new ApolloClient({
    uri: "https://api-ap-southeast-2.graphcms.com/v2/cl201gs0b2vrh01xu78h65x10/master",
    cache: new InMemoryCache(),
  });
  const data = await client.query({
    query: gql`
      query HomePage($locale: Locale!) {
        page(where: { slug: "home" }) {
          heroLink
          heroText
          heroTitle
          id
          name
          slug
          heroBg
          localizations(locales: [$locale]) {
            heroText
            heroTitle
            locale
          }
        }
        products(where: { categories_some: { slug: "featured" } }) {
          id
          name
          price
          slug
          image
        }
      }
    `,
    variables: {
      locale,
    },
  });
  let home = data.data.page;
  if (home.localizations.length > 0) {
    home = {
      ...home,
      ...home.localizations[0],
    };
  }
  const featuredProducts = data.data.products;

  return {
    props: {
      home,
      featuredProducts,
    },
  };
}
