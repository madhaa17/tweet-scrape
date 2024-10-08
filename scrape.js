import { Builder, By, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";

const scrapeTweets = async () => {
  const chromeOptions = new Options();
  chromeOptions.addArguments("--headless");
  chromeOptions.addArguments("--no-sandbox");
  chromeOptions.addArguments("--disable-dev-shm-usage");

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .build();

  try {
    await driver.get("https://x.com/home");

    await driver.manage().addCookie({
      name: "auth_token",
      value: "YOUR_AUTH_TOKEN",
      domain: ".x.com",
    });

    await driver.get("https://x.com/home");

    await driver.wait(until.elementLocated(By.tagName("article")), 10000);

    for (let i = 0; i < 3; i++) {
      await driver.executeScript(
        "window.scrollTo(0, document.body.scrollHeight);"
      );
      await driver.sleep(20000);
    }

    const tweetElements = await driver.findElements(By.xpath("//article"));

    const tweets = await Promise.all(
      tweetElements.map(async (element) => {
        try {
          const tweetTextElement = await element.findElement(
            By.xpath('.//div[@data-testid="tweetText"]//span')
          );

          const tweetText = tweetTextElement
            ? await tweetTextElement.getText()
            : "";

          // Clean up tweet text
          const cleanTweetText = tweetText.replace(/\n/g, " ").trim();

          return {
            tweet: cleanTweetText,
          };
        } catch (innerError) {
          console.error("Error extracting tweet:", innerError);
          return null; // Return null for any failed tweet extraction
        }
      })
    );

    // Filter out any null results
    const filteredTweets = tweets.filter((tweet) => tweet !== null);

    const jsonResponse = JSON.stringify({ tweets: filteredTweets });
    console.log(jsonResponse);
  } catch (error) {
    console.error("Error during scraping:", error);
  } finally {
    await driver.quit();
  }
};

scrapeTweets();
