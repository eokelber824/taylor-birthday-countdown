#!/usr/bin/env python3
"""Verify countdown math for Taylor's birthday site."""

import datetime
import zoneinfo

TARGET_MS = 1784563200000
TARGET_UTC = datetime.datetime(2026, 7, 20, 16, 0, 0, tzinfo=datetime.timezone.utc)

def test_target_ms_matches_utc():
    computed = int(TARGET_UTC.timestamp() * 1000)
    assert TARGET_MS == computed, f"TARGET_MS {TARGET_MS} != computed {computed}"

def test_pacific_display():
    pt = TARGET_UTC.astimezone(zoneinfo.ZoneInfo("America/Los_Angeles"))
    assert pt.hour == 9
    assert pt.minute == 0
    assert pt.month == 7
    assert pt.day == 20
    assert pt.year == 2026
    # July is PDT (UTC-7)
    assert pt.strftime("%Z") == "PDT"

def test_remaining_never_nan():
    now_ms = int(datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000)
    diff = TARGET_MS - now_ms
    assert isinstance(diff, int)
    if diff > 0:
        total_seconds = diff // 1000
        days = total_seconds // 86400
        hours = (total_seconds % 86400) // 3600
        minutes = (total_seconds % 3600) // 60
        seconds = total_seconds % 60
        for val in (days, hours, minutes, seconds):
            assert val >= 0
            assert val == int(val)

def test_zero_state():
    past_ms = TARGET_MS - 1
    diff = TARGET_MS - past_ms
    assert diff == 1
    zero_diff = TARGET_MS - TARGET_MS
    assert zero_diff == 0

if __name__ == "__main__":
    test_target_ms_matches_utc()
    test_pacific_display()
    test_remaining_never_nan()
    test_zero_state()
    print("All countdown math tests passed.")
    print(f"TARGET_MS = {TARGET_MS}")
    print(f"Event (Pacific): {TARGET_UTC.astimezone(zoneinfo.ZoneInfo('America/Los_Angeles')).strftime('%A, %B %d, %Y %I:%M %p %Z')}")
