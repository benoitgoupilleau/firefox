/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

add_task(async function testContentTypeSniffing() {
  info("Test JSONL content-type sniffing started");

  for (const type of ["application/jsonlines", "application/x-ndjson"]) {
    const TEST_URL = `data:${type},${encodeURIComponent('{"a":1}\n{"b":2}\n')}`;
    const tab = await addJsonViewTab(TEST_URL);

    await SpecialPowers.spawn(tab.linkedBrowser, [], () => {
      ok(
        content.wrappedJSObject.JSONView.isJsonl,
        "JSONView.isJsonl is exposed and true"
      );
    });

    BrowserTestUtils.removeTab(tab);
  }
});

add_task(async function testLineByLineParsing() {
  info("Test JSONL line-by-line parsing started");

  // All three parsed lines are primitives (no children), so the row
  // count is exactly the number of non-blank lines — no auto-expand
  // of nested children to account for.
  const content = ["1", "", '"three"', "not json", ""].join("\n");
  const TEST_URL = `data:application/jsonlines,${encodeURIComponent(content)}`;
  const tab = await addJsonViewTab(TEST_URL);

  is(await getRowsCount(), 3, "One row per non-blank line");
  is(await getRowText(0), `Line 1: 1`, "Line 1 parsed as a number");
  is(await getRowText(1), `Line 3: "three"`, "Line 3 parsed as a string");
  // Line 4 ("not json") could not be parsed as JSON; it's the 3rd row
  // (blank lines 2 and 5 add no row). Task 3 gives this a readable
  // rendering; for now, just confirm it doesn't stop the rest of the
  // document from being usable.
  const row3Label = await getElementText(
    `.jsonPanelBox .treeTable .treeRow:nth-of-type(3) .treeLabelCell`
  );
  is(row3Label, "Line 4", "Line 4 (invalid JSON) still gets its own row");

  BrowserTestUtils.removeTab(tab);
});

add_task(async function testExtensionFallback() {
  info("Test .jsonl extension fallback started");

  const TEST_URL = URL_ROOT + "jsonl_no_contenttype.jsonl";
  const tab = await addJsonViewTab(TEST_URL);

  await SpecialPowers.spawn(tab.linkedBrowser, [], () => {
    ok(
      content.wrappedJSObject.JSONView.isJsonl,
      "JSONView.isJsonl is exposed and true for a .jsonl file " +
        "served with a non-matching content type"
    );
  });

  BrowserTestUtils.removeTab(tab);
});
