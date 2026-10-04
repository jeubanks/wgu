import pytest

import lesson4


@pytest.mark.parametrize('check', lesson4.CHECKS, ids=lambda c: c.__doc__)
def test_exercise(check):
    """Lesson 4: BSTs, traversals, and heaps."""
    try:
        check()
    except NotImplementedError:
        pytest.skip('not started')
