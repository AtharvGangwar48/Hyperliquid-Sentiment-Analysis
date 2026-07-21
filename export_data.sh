#!/bin/bash
DB="/Users/atharvgangwar/.gemini/antigravity-ide/brain/2ca261d7-2036-494b-8f41-ee194c3e3935/scratch/data.db"

sqlite3 "$DB" << 'SQL' > /Users/atharvgangwar/Desktop/project/dashboard_data.json
.mode json

WITH cleaned AS (
    SELECT 
        Account,
        Coin,
        Side,
        Direction,
        CAST("Execution Price" AS REAL) as price,
        CAST("Size USD" AS REAL) as size_usd,
        CAST("Closed PnL" AS REAL) as closed_pnl,
        CAST("Fee" AS REAL) as fee,
        substr("Timestamp IST", 7, 4) || '-' || substr("Timestamp IST", 4, 2) || '-' || substr("Timestamp IST", 1, 2) as trade_date
    FROM historical
),
joined AS (
    SELECT 
        c.*,
        f.value as fg_value,
        f.classification as fg_class
    FROM cleaned c
    JOIN fear_greed f ON c.trade_date = f.date
),
regime_stats AS (
    SELECT 
        fg_class,
        COUNT(*) as total_trades,
        ROUND(SUM(size_usd), 2) as volume_usd,
        ROUND(SUM(closed_pnl), 2) as pnl_usd,
        ROUND(AVG(closed_pnl), 2) as avg_pnl,
        ROUND(SUM(CASE WHEN closed_pnl > 0 THEN 1 ELSE 0 END) * 100.0 / NULLIF(SUM(CASE WHEN closed_pnl != 0 THEN 1 ELSE 0 END), 0), 2) as win_rate_pct,
        ROUND(SUM(CASE WHEN closed_pnl > 0 THEN closed_pnl ELSE 0 END) / NULLIF(ABS(SUM(CASE WHEN closed_pnl < 0 THEN closed_pnl ELSE 0 END)), 0), 2) as profit_factor,
        ROUND(SUM(CASE WHEN Side = 'BUY' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as buy_side_pct,
        COUNT(DISTINCT trade_date) as active_days,
        ROUND(SUM(size_usd) / COUNT(DISTINCT trade_date), 2) as avg_daily_vol,
        ROUND(SUM(closed_pnl) / COUNT(DISTINCT trade_date), 2) as avg_daily_pnl
    FROM joined
    GROUP BY fg_class
),
trader_stats AS (
    SELECT 
        Account,
        COUNT(*) as total_trades,
        ROUND(SUM(CAST("Size USD" AS REAL)), 2) as total_vol,
        ROUND(SUM(CAST("Closed PnL" AS REAL)), 2) as total_pnl,
        ROUND(SUM(CASE WHEN CAST("Closed PnL" AS REAL) > 0 THEN 1 ELSE 0 END) * 100.0 / NULLIF(SUM(CASE WHEN CAST("Closed PnL" AS REAL) != 0 THEN 1 ELSE 0 END), 0), 2) as win_rate,
        ROUND(SUM(CASE WHEN Side = 'BUY' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as buy_pct
    FROM historical
    GROUP BY Account
),
coin_stats AS (
    SELECT 
        Coin,
        COUNT(*) as total_trades,
        ROUND(SUM(CAST("Size USD" AS REAL)), 2) as total_vol,
        ROUND(SUM(CAST("Closed PnL" AS REAL)), 2) as total_pnl,
        ROUND(SUM(CASE WHEN CAST("Closed PnL" AS REAL) > 0 THEN 1 ELSE 0 END) * 100.0 / NULLIF(SUM(CASE WHEN CAST("Closed PnL" AS REAL) != 0 THEN 1 ELSE 0 END), 0), 2) as win_rate
    FROM historical
    GROUP BY Coin
    ORDER BY total_vol DESC
    LIMIT 20
),
daily_series AS (
    SELECT 
        j.trade_date as date,
        CAST(j.fg_value AS INTEGER) as fg_value,
        j.fg_class as fg_class,
        COUNT(*) as daily_trades,
        ROUND(SUM(j.size_usd), 2) as daily_vol,
        ROUND(SUM(j.closed_pnl), 2) as daily_pnl,
        ROUND(SUM(CASE WHEN j.Side = 'BUY' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as daily_buy_pct
    FROM joined j
    GROUP BY j.trade_date
    ORDER BY j.trade_date ASC
)
SELECT json_object(
    'summary', json_object(
        'total_trades', (SELECT COUNT(*) FROM historical),
        'total_volume', (SELECT ROUND(SUM(CAST("Size USD" AS REAL)), 2) FROM historical),
        'total_pnl', (SELECT ROUND(SUM(CAST("Closed PnL" AS REAL)), 2) FROM historical),
        'unique_traders', (SELECT COUNT(DISTINCT Account) FROM historical),
        'unique_coins', (SELECT COUNT(DISTINCT Coin) FROM historical),
        'overall_win_rate', (SELECT ROUND(SUM(CASE WHEN CAST("Closed PnL" AS REAL) > 0 THEN 1 ELSE 0 END) * 100.0 / SUM(CASE WHEN CAST("Closed PnL" AS REAL) != 0 THEN 1 ELSE 0 END), 2) FROM historical)
    ),
    'regimes', (SELECT json_group_array(json_object(
        'regime', fg_class,
        'trades', total_trades,
        'volume_usd', volume_usd,
        'pnl_usd', pnl_usd,
        'avg_pnl', avg_pnl,
        'win_rate_pct', win_rate_pct,
        'profit_factor', profit_factor,
        'buy_side_pct', buy_side_pct,
        'active_days', active_days,
        'avg_daily_vol', avg_daily_vol,
        'avg_daily_pnl', avg_daily_pnl
    )) FROM regime_stats),
    'traders', (SELECT json_group_array(json_object(
        'account', Account,
        'total_trades', total_trades,
        'total_vol', total_vol,
        'total_pnl', total_pnl,
        'win_rate', win_rate,
        'buy_pct', buy_pct
    )) FROM trader_stats ORDER BY total_pnl DESC),
    'top_coins', (SELECT json_group_array(json_object(
        'coin', Coin,
        'total_trades', total_trades,
        'total_vol', total_vol,
        'total_pnl', total_pnl,
        'win_rate', win_rate
    )) FROM coin_stats),
    'daily_series', (SELECT json_group_array(json_object(
        'date', date,
        'fg_value', fg_value,
        'fg_class', fg_class,
        'daily_trades', daily_trades,
        'daily_vol', daily_vol,
        'daily_pnl', daily_pnl,
        'daily_buy_pct', daily_buy_pct
    )) FROM daily_series)
);

SQL
chmod +x /Users/atharvgangwar/Desktop/project/export_data.sh
/Users/atharvgangwar/Desktop/project/export_data.sh
