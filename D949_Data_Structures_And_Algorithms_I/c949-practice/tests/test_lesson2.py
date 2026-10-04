import pytest

import lesson2


@pytest.mark.parametrize('check', lesson2.CHECKS, ids=lambda c: c.__doc__)
def test_exercise(check):
    """Lesson 2: Linked lists, stacks, and queues."""
    try:
        check()
    except NotImplementedError:
        pytest.skip('not started')
