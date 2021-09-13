import { FC } from "react";
import cx from "class-names";
import { OrderBookState, Side, SubscriptionState } from "../../state";
import { OrderBookSideRenderer } from "../OrderBookSideRenderer";
import styles from "../order-book-styles.module.css";

const isDebugging = false;

type OrderBookRendererProps = {
  currentProductId: string;
  otherProductId: string;
  orderBookMaxTotal: number;
  orderBookSubscriptionState: string;
  orderBookSpreadValue: number;
  orderBookSpreadPercent: number;
  orderBookPrices: OrderBookState["prices"];
  orderBookEntries: OrderBookState["entries"];
  orderBookLastMessage: object;
  canConnect: boolean;
  canStopStreaming: boolean;
  startStopStreaming: () => void;
  changeStreaming: () => void;
};

export const OrderBookRenderer: FC<OrderBookRendererProps> = ({
  currentProductId,
  otherProductId,
  canStopStreaming,
  canConnect,
  orderBookMaxTotal,
  orderBookEntries,
  orderBookSpreadValue,
  orderBookSpreadPercent,
  orderBookPrices,
  orderBookSubscriptionState,
  orderBookLastMessage,
  startStopStreaming,
  changeStreaming,
}) => {
  const spreadJSX = (
    <span className={styles.spread}>
      Spread: {orderBookSpreadValue} ({orderBookSpreadPercent}%)
    </span>
  );
  const spreadJSXOnLargeScreen = (
    <span className={styles.spreadOnLargeScreen}>{spreadJSX}</span>
  );
  const spreadJSXOnSmallScreen = (
    <span key={"spread"} className={styles.spreadOnSmallScreen}>
      {spreadJSX}
    </span>
  );

  const priceSides = [Side.ASKS, Side.BIDS].map((side) => {
    return (
      <OrderBookSideRenderer
        key={side}
        prices={orderBookPrices[side]}
        entries={orderBookEntries[side]}
        orderBookMaxTotal={orderBookMaxTotal}
        side={side}
        isDebugging={isDebugging}
      />
    );
  });

  // injecting spread between sides for mobile
  priceSides.splice(1, 0, spreadJSXOnSmallScreen);

  return (
    <div className={styles.orderBook}>
      <div className={styles.orderBookHeader}>
        <div className={styles.orderBookHeaderTitle}>
          <span>Order Book</span>
          <span>{currentProductId}</span>
          <span
            className={cx({
              [styles.errorColor]:
                orderBookSubscriptionState ===
                SubscriptionState.DISCONNECTED_UNCLEAN,
              [styles.disabledColor]:
                orderBookSubscriptionState === SubscriptionState.DISCONNECTED,
              [styles.successColor]:
                orderBookSubscriptionState === SubscriptionState.SUBSCRIBED,
            })}
          >
            {orderBookSubscriptionState}
          </span>
        </div>
        <div className={styles.orderBookHeaderSpread}>
          {spreadJSXOnLargeScreen}
        </div>
      </div>
      <div className={styles.priceTablesContainer}>{priceSides}</div>
      <div className={styles.orderBookButtonsContainer}>
        <button
          onClick={startStopStreaming}
          disabled={!canConnect && !canStopStreaming}
        >
          {canConnect ? "Start" : canStopStreaming ? "Stop" : "------"}{" "}
          {currentProductId}
        </button>
        <button onClick={changeStreaming}>Toggle Feed {otherProductId}</button>
      </div>
      {isDebugging && <div>{JSON.stringify(orderBookLastMessage)}</div>}
    </div>
  );
};
